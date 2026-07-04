"use client";

import { useState, useRef } from "react";
import { UploadCloud, XCircle, FileVideo, Video } from "lucide-react";
import { toast } from "sonner";

interface VideoUploadProps {
    lessonId?: string;
    onUploadComplete: (assetData: { muxPlaybackId?: string, muxAssetId?: string, url?: string, uploadId?: string }) => void;
    currentPlaybackId?: string;
    currentUrl?: string;
}

export default function VideoUpload({ lessonId, onUploadComplete, currentPlaybackId, currentUrl }: VideoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [localFileName, setLocalFileName] = useState<string | null>(null);
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024 * 1024) { // 4 GB
            toast.error("Video file size must be under 4GB");
            return;
        }

        // Reset state
        setError(null);
        setIsUploading(true);
        setProgress(0);
        setLocalFileName(file.name);

        try {
            // 1. Get the Signed Direct Upload URL from our secure Next.js Backend
            const res = await fetch("/api/mux/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lessonId }), // Pass lessonId so webhook knows where to map it
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to get upload URL");
            }

            const { uploadUrl, uploadId } = await res.json();

            // 2. Upload the RAW video file directly to Mux using XHR for progress tracking
            const xhr = new XMLHttpRequest();
            xhrRef.current = xhr;

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    toast.success("Video uploaded to Mux! Processing started...");
                    setIsUploading(false);
                    // We let the parent know we uploaded, yielding the uploadId for pending records
                    onUploadComplete({ url: "processing", uploadId });
                } else {
                    throw new Error(`Upload failed with status ${xhr.status}`);
                }
            };

            xhr.onerror = () => {
                throw new Error("Network error during Mux upload");
            };

            xhr.open("PUT", uploadUrl, true);
            // Mux direct uploads usually require content type to match
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);

        } catch (err: unknown) {
            console.error("Mux Upload error:", err);
            setError(err instanceof Error ? err.message : "Upload failed");
            toast.error("Failed to upload video to Mux");
            setIsUploading(false);
        }
    };

    const cancelUpload = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
            setIsUploading(false);
            setProgress(0);
            toast.info("Upload cancelled");
        }
    };

    return (
        <div className="w-full">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-white transition-colors">
                {/* Upload State */}
                {!currentPlaybackId && !currentUrl && !isUploading && (
                    <div className="flex flex-col items-center justify-center text-center cursor-pointer relative">
                        <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">Click to upload video</p>
                        <p className="text-xs text-gray-400 mt-1">Direct upload powered by Mux</p>
                    </div>
                )}

                {/* Progress State */}
                {isUploading && (
                    <div className="flex flex-col items-center justify-center text-center w-full max-w-sm mx-auto">
                        <Video className="w-8 h-8 text-emerald-600 animate-pulse mb-3" />
                        <p className="text-sm font-medium text-gray-700 mb-2 truncate w-full">Uploading {localFileName}</p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between w-full text-xs text-gray-500 mb-4">
                            <span>{progress}%</span>
                            <button onClick={cancelUpload} className="text-rose-500 hover:text-rose-700 font-medium">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Completed State */}
                {(currentPlaybackId || currentUrl) && !isUploading && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileVideo className="w-5 h-5 text-emerald-600" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-emerald-900 truncate max-w-[200px]">
                                    {currentUrl === 'processing' ? 'Video Processing in Mux...' : 'Video Uploaded'}
                                </p>
                                {currentPlaybackId && (
                                    <span className="text-xs text-emerald-600">Adaptive Streaming Ready</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => onUploadComplete({})} // Passes empty to signal delete intent
                            className="p-1 hover:bg-emerald-100 rounded-full text-emerald-700 transition-colors"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="mt-3 flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
