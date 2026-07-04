import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// File size limits (in bytes)
// ---------------------------------------------------------------------------
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50 MB

const MAX_FILE_SIZE: Record<FileCategory, number> = {
    pdf: 50 * 1024 * 1024,       // 50 MB
    zip: 250 * 1024 * 1024,      // 250 MB
    image: 5 * 1024 * 1024,      // 5 MB
    video: 4 * 1024 * 1024 * 1024, // 4 GB
    document: 50 * 1024 * 1024,  // 50 MB
};

// ---------------------------------------------------------------------------
// Allowed MIME types
// ---------------------------------------------------------------------------
const ALLOWED_TYPES = {
    pdf: ['application/pdf'],
    zip: ['application/zip', 'application/x-zip-compressed'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'],
    document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type FileCategory = 'pdf' | 'zip' | 'image' | 'video' | 'document';

export interface UploadOptions {
    /** Supabase Storage bucket name. Defaults to 'uploads'. */
    bucket?: string;
    /** Sub-folder path inside the bucket, e.g. 'course-thumbnails'. */
    folder?: string;
    /** Override the list of accepted MIME types. */
    allowedTypes?: string[];
    /** Override the maximum file size in bytes. */
    maxSize?: number;
}

export interface UploadResult {
    /** Fully-qualified public URL of the uploaded file. */
    url: string;
    /** Supabase storage path (bucket-relative), e.g. 'course-thumbnails/file-123.jpg'. */
    path: string;
    size: number;
    name: string;
    type: string;
}

export interface BatchUploadResult {
    results: UploadResult[];
    errors: string[];
}

// ---------------------------------------------------------------------------
// Magic byte signatures — real file-type detection
// Browsers report file.type from the OS/extension, which a hacker can spoof.
// We read the actual binary header to confirm the file is what it claims to be.
// ---------------------------------------------------------------------------
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }[]> = {
    'image/jpeg':   [{ bytes: [0xFF, 0xD8, 0xFF], offset: 0 }],
    'image/png':    [{ bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0 }],
    'image/gif':    [{ bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 }],
    'image/webp':   [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }],
    'application/pdf': [{ bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }],
    'application/zip': [{ bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 }],
    'application/x-zip-compressed': [{ bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 }],
    // Office Open XML (docx, xlsx, pptx) are zip-based — same PK header
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':   [{ bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 }],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':         [{ bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 }],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': [{ bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 }],
    // Legacy Office (OLE Compound Document format)
    'application/msword':       [{ bytes: [0xD0, 0xCF, 0x11, 0xE0], offset: 0 }],
    'application/vnd.ms-excel': [{ bytes: [0xD0, 0xCF, 0x11, 0xE0], offset: 0 }],
    // MP4: check for 'ftyp' box at offset 4
    'video/mp4':       [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }],
    'video/quicktime': [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }],
    'video/x-msvideo': [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }], // AVI = RIFF
    'video/x-ms-wmv':  [{ bytes: [0x30, 0x26, 0xB2, 0x75], offset: 0 }],
};

/**
 * Reads the first 12 bytes of a file and checks them against known magic byte signatures.
 * Prevents a renamed .exe or .php from being accepted as an image or document.
 * Returns true if the check passes or if no signature is registered for the type.
 */
async function verifyMagicBytes(file: File, mimeType: string): Promise<boolean> {
    const signatures = MAGIC_BYTES[mimeType];
    if (!signatures) return true; // No signature on file: allow (safe fallback)

    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    return signatures.some(sig =>
        sig.bytes.every((b, i) => bytes[sig.offset + i] === b)
    );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates a File against the supplied MIME type list, size cap, and binary magic bytes.
 * Returns `{ valid: true }` on success, or `{ valid: false, error }` on failure.
 */
export async function validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number
): Promise<{ valid: boolean; error?: string }> {
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type "${file.type}". Allowed: ${allowedTypes.join(', ')}`,
        };
    }

    if (file.size > maxSize) {
        const maxSizeLabel = maxSize >= 1024 * 1024 * 1024
            ? `${(maxSize / 1024 / 1024 / 1024).toFixed(0)} GB`
            : `${Math.round(maxSize / 1024 / 1024)} MB`;
        return {
            valid: false,
            error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: ${maxSizeLabel}`,
        };
    }

    // Deep check: verify actual binary header matches declared MIME type
    const magicValid = await verifyMagicBytes(file, file.type);
    if (!magicValid) {
        return {
            valid: false,
            error: `File content does not match its declared type. Upload rejected for security reasons.`,
        };
    }

    return { valid: true };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the MIME type list for a given category (or all combined).
 */
export function getAllowedTypes(
    category: FileCategory | 'all'
): string[] {
    if (category === 'all') {
        return [
            ...ALLOWED_TYPES.image,
            ...ALLOWED_TYPES.video,
            ...ALLOWED_TYPES.document,
            ...ALLOWED_TYPES.zip,
        ];
    }
    return [...ALLOWED_TYPES[category]];
}

/**
 * Returns the maximum file size (in bytes) for a given category.
 */
export function getMaxSize(category: FileCategory): number {
    return MAX_FILE_SIZE[category] ?? DEFAULT_MAX_SIZE;
}

/**
 * Generates a collision-safe, URL-friendly filename.
 * Example: "My Document.pdf" → "my-document-1716823456789-k3f9a2.pdf"
 */
function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);

    const lastDot = originalName.lastIndexOf('.');
    const extension = lastDot !== -1 ? originalName.slice(lastDot) : '';
    const baseName = originalName
        .slice(0, lastDot !== -1 ? lastDot : undefined)
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase()
        .substring(0, 50);

    return `${baseName}-${timestamp}-${randomString}${extension}`;
}

// ---------------------------------------------------------------------------
// Core: Upload
// ---------------------------------------------------------------------------

/**
 * Uploads a single File to Supabase Storage.
 *
 * @example
 * const result = await uploadFile(file, { bucket: 'course-assets', folder: 'thumbnails' });
 * console.log(result.url); // https://xxx.supabase.co/storage/v1/object/public/...
 */
export async function uploadFile(
    file: File,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const {
        bucket = 'uploads',
        folder = '',
        allowedTypes = getAllowedTypes('all'),
        maxSize = DEFAULT_MAX_SIZE,
    } = options;

    // 1. Validate (async — includes magic byte check)
    const validation = await validateFile(file, allowedTypes, maxSize);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // 2. Build a collision-safe path
    const fileName = generateFileName(file.name);
    const storagePath = folder ? `${folder}/${fileName}` : fileName;

    // 3. Upload to Supabase Storage
    const { error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('[upload] Supabase Storage error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    // 4. Retrieve the public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

    return {
        url: urlData.publicUrl,
        path: storagePath,
        size: file.size,
        name: file.name,
        type: file.type,
    };
}

/**
 * Uploads multiple files concurrently to Supabase Storage.
 * Individual failures are captured in `errors` rather than throwing.
 *
 * @example
 * const { results, errors } = await uploadFiles(fileList, { bucket: 'course-assets' });
 */
export async function uploadFiles(
    files: File[],
    options: UploadOptions = {}
): Promise<BatchUploadResult> {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
        try {
            const result = await uploadFile(file, options);
            results.push(result);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`${file.name}: ${message}`);
        }
    }

    return { results, errors };
}

// ---------------------------------------------------------------------------
// Core: Download / URL helpers
// ---------------------------------------------------------------------------

/**
 * Returns the public URL for an existing file in Supabase Storage.
 * Use this when you only need the URL for displaying or linking (no re-upload).
 *
 * @example
 * const url = getPublicUrl('course-assets', 'thumbnails/my-image-123.jpg');
 */
export function getPublicUrl(bucket: string, storagePath: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
}

/**
 * Generates a temporary signed URL for a **private** bucket file.
 * The link expires after `expiresInSeconds` (default: 1 hour).
 *
 * @example
 * const url = await getSignedUrl('private-assets', 'reports/file.pdf', 3600);
 */
export async function getSignedUrl(
    bucket: string,
    storagePath: string,
    expiresInSeconds = 3600
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
        throw new Error(`Could not generate signed URL: ${error?.message ?? 'Unknown error'}`);
    }

    return data.signedUrl;
}

/**
 * Deletes a file from Supabase Storage.
 *
 * @example
 * await deleteFile('course-assets', 'thumbnails/my-image-123.jpg');
 */
export async function deleteFile(
    bucket: string,
    storagePath: string
): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);

    if (error) {
        console.error('[upload] Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
    }
}
