"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";

// ─── Helper: Get DB user by email (for admin actions) ───
export async function getUserByEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return { success: true, data: user };
    } catch {
        return { success: false, data: null };
    }
}

export type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: "draft" | "published" | "scheduled";
    authorName: string;
    authorId: string;
    category: string | null;
    tags: string[];
    featured: boolean;
    featuredImage: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    views: number;
    scheduledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

type GetBlogsParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "draft" | "published" | "scheduled";
};

// ─── Admin: Fetch all blogs (with filters) ───

export async function getBlogs({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
}: GetBlogsParams = {}) {
    noStore();
    await requireRole('ADMIN');
    try {
        const skip = (page - 1) * limit;

        const where: Prisma.BlogWhereInput = {
            AND: [
                search
                    ? {
                        OR: [
                            { title: { contains: search, mode: "insensitive" } },
                            { excerpt: { contains: search, mode: "insensitive" } },
                        ],
                    }
                    : {},
                status !== "all" ? { status } : {},
            ],
        };

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    author: { select: { name: true, id: true } },
                },
            }),
            prisma.blog.count({ where }),
        ]);

        const formatted: BlogPost[] = blogs.map((b) => ({
            id: b.id,
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt,
            content: b.content,
            status: b.status as "draft" | "published" | "scheduled",
            authorName: b.author.name,
            authorId: b.author.id,
            category: b.category,
            tags: b.tags,
            featured: b.featured,
            featuredImage: b.featuredImage,
            seoTitle: b.seoTitle,
            seoDescription: b.seoDescription,
            views: b.views,
            scheduledAt: b.scheduledAt,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt,
        }));

        return {
            success: true,
            data: { blogs: formatted, total, totalPages: Math.ceil(total / limit) },
        };
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return { success: false, error: "Failed to fetch blogs" };
    }
}

// ─── Public: Fetch by slug ───────────────────────────────────────────────────

export async function getBlogBySlug(slug: string) {
    try {
        const blog = await prisma.blog.findUnique({
            where: { slug },
            include: { author: { select: { name: true } } },
        });
        if (!blog) return { success: false, error: "Blog not found" };
        return { success: true, data: blog };
    } catch (error) {
        console.error("Error fetching blog:", error);
        return { success: false, error: "Failed to fetch blog" };
    }
}

// ─── Public: Fetch published blogs ──────────────────────────────────────────

export async function getPublishedBlogs({
    limit,
    search,
    category,
}: { limit?: number; search?: string; category?: string } = {}) {
    try {
        const where: Prisma.BlogWhereInput = {
            status: "published",
            ...(search
                ? {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { excerpt: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
            ...(category ? { category } : {}),
        };

        const blogs = await prisma.blog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            ...(limit ? { take: limit } : {}),
            include: { author: { select: { name: true } } },
        });

        return { success: true, data: blogs };
    } catch (error) {
        console.error("Error fetching published blogs:", error);
        return { success: false, error: "Failed to fetch blogs" };
    }
}

// ─── Admin: Create a blog post ───────────────────────────────────────────────

type CreateBlogInput = {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    authorId: string;
    category?: string;
    status?: string;
    featuredImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    featured?: boolean;
    scheduledAt?: string | null;
};

export async function createBlog(input: CreateBlogInput) {
    await requireRole('ADMIN');
    try {
        const blog = await prisma.blog.create({
            data: {
                title: input.title,
                slug: input.slug,
                content: input.content,
                excerpt: input.excerpt,
                authorId: input.authorId,
                category: input.category || null,
                status: input.status || "draft",
                featuredImage: input.featuredImage || null,
                seoTitle: input.seoTitle || null,
                seoDescription: input.seoDescription || null,
                tags: input.tags || [],
                featured: input.featured || false,
                scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
            },
        });

        revalidatePath("/admin/blog");
        revalidatePath("/blog");
        return { success: true, data: blog };
    } catch (error: unknown) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return { success: false, error: "A post with this slug already exists" };
        }
        console.error("Error creating blog:", error);
        return { success: false, error: "Failed to create blog post" };
    }
}

// ─── Admin: Update a blog post ───────────────────────────────────────────────

type UpdateBlogInput = Partial<Omit<CreateBlogInput, "authorId">>;

export async function updateBlog(id: string, input: UpdateBlogInput) {
    await requireRole('ADMIN');
    try {
        const blog = await prisma.blog.update({
            where: { id },
            data: {
                ...input,
                tags: input.tags ?? undefined,
                scheduledAt:
                    input.scheduledAt !== undefined
                        ? input.scheduledAt ? new Date(input.scheduledAt) : null
                        : undefined,
            },
        });

        revalidatePath("/admin/blog");
        revalidatePath(`/blog/${blog.slug}`);
        revalidatePath("/blog");
        return { success: true, data: blog };
    } catch (error) {
        console.error("Error updating blog:", error);
        return { success: false, error: "Failed to update blog post" };
    }
}

// ─── Admin: Delete a blog post ───────────────────────────────────────────────

export async function deleteBlog(id: string) {
    await requireRole('ADMIN');
    try {
        const blog = await prisma.blog.delete({ where: { id } });
        revalidatePath("/admin/blog");
        revalidatePath(`/blog/${blog.slug}`);
        revalidatePath("/blog");
        return { success: true };
    } catch (error) {
        console.error("Error deleting blog:", error);
        return { success: false, error: "Failed to delete blog post" };
    }
}

// ─── Admin: Toggle featured status ──────────────────────────────────────────

export async function toggleBlogFeatured(id: string, featured: boolean) {
    await requireRole('ADMIN');
    try {
        await prisma.blog.update({ where: { id }, data: { featured } });
        revalidatePath("/admin/blog");
        revalidatePath("/blog");
        return { success: true };
    } catch (error) {
        console.error("Error toggling featured:", error);
        return { success: false, error: "Failed to update featured status" };
    }
}

// ─── Admin: Change blog status ───────────────────────────────────────────────

export async function changeBlogStatus(
    id: string,
    status: "draft" | "published" | "scheduled"
) {
    await requireRole('ADMIN');
    try {
        await prisma.blog.update({ where: { id }, data: { status } });
        revalidatePath("/admin/blog");
        revalidatePath("/blog");
        return { success: true };
    } catch (error) {
        console.error("Error changing blog status:", error);
        return { success: false, error: "Failed to change blog status" };
    }
}

// ─── Public: Increment view count ───────────────────────────────────────────

export async function incrementBlogViews(id: string) {
    try {
        await prisma.blog.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
        return { success: true };
    } catch {
        //  silently fail — not critical
        return { success: false };
    }
}
