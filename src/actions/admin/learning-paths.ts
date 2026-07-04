"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function getLearningPaths() {
    noStore();
    try {
        await requireRole("ADMIN");
        const paths = await prisma.learningPath.findMany({
            include: {
                _count: { select: { courses: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        return paths;
    } catch (error: unknown) {
        logger.error({ error }, "Failed to fetch learning paths");
        throw new Error("Failed to fetch learning paths");
    }
}

export async function getLearningPathById(id: string) {
    noStore();
    try {
        await requireRole("ADMIN");
        const path = await prisma.learningPath.findUnique({
            where: { id },
            include: {
                courses: {
                    include: {
                        course: {
                            select: { id: true, title: true, published: true }
                        }
                    },
                    orderBy: { position: "asc" }
                }
            }
        });

        if (!path) return null;

        // Map it back to a flat course array for the UI
        return {
            ...path,
            courses: path.courses.map((pc) => pc.course)
        };
    } catch (error: unknown) {
        logger.error({ error }, `Failed to fetch learning path ${id}`);
        throw new Error("Failed to fetch learning path");
    }
}

export async function createLearningPath(data: { title: string; description?: string; slug: string; isPublished?: boolean }) {
    try {
        await requireRole("ADMIN");
        const path = await prisma.learningPath.create({
            data: {
                title: data.title,
                description: data.description || "",
                slug: data.slug,
                published: data.isPublished || false
            }
        });
        revalidatePath("/admin/learning-paths");
        return path;
    } catch (error: unknown) {
        logger.error({ error }, "Failed to create learning path");
        throw new Error("Failed to create learning path");
    }
}

export async function updateLearningPath(id: string, data: { title?: string; description?: string; slug?: string; isPublished?: boolean }) {
    try {
        await requireRole("ADMIN");
        const path = await prisma.learningPath.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.slug && { slug: data.slug }),
                ...(data.isPublished !== undefined && { published: data.isPublished })
            }
        });
        revalidatePath("/admin/learning-paths");
        revalidatePath(`/admin/learning-paths/${id}`);
        return path;
    } catch (error: unknown) {
        logger.error({ error }, `Failed to update learning path ${id}`);
        throw new Error("Failed to update learning path");
    }
}

export async function deleteLearningPath(id: string) {
    try {
        await requireRole("ADMIN");
        await prisma.learningPath.delete({
            where: { id }
        });
        revalidatePath("/admin/learning-paths");
        return true;
    } catch (error: unknown) {
        logger.error({ error }, `Failed to delete learning path ${id}`);
        throw new Error("Failed to delete learning path");
    }
}

export async function addCourseToPath(pathId: string, courseId: string) {
    try {
        await requireRole("ADMIN");
        
        // Find highest position
        const latestCourse = await prisma.learningPathCourse.findFirst({
            where: { learningPathId: pathId },
            orderBy: { position: "desc" }
        });
        
        const newPosition = latestCourse ? latestCourse.position + 1 : 0;

        await prisma.learningPathCourse.create({
            data: {
                learningPathId: pathId,
                courseId: courseId,
                position: newPosition
            }
        });
        revalidatePath(`/admin/learning-paths/${pathId}`);
        return true;
    } catch (error: unknown) {
        logger.error({ error }, `Failed to add course ${courseId} to path ${pathId}`);
        throw new Error("Failed to add course to path");
    }
}

export async function removeCourseFromPath(pathId: string, courseId: string) {
    try {
        await requireRole("ADMIN");
        await prisma.learningPathCourse.deleteMany({
            where: {
                learningPathId: pathId,
                courseId: courseId
            }
        });
        revalidatePath(`/admin/learning-paths/${pathId}`);
        return true;
    } catch (error: unknown) {
        logger.error({ error }, `Failed to remove course ${courseId} from path ${pathId}`);
        throw new Error("Failed to remove course from path");
    }
}

export async function getAvailableCoursesForPath(pathId: string) {
    noStore();
    try {
        await requireRole("ADMIN");
        // Get all courses that are NOT connected to this path id
        const courses = await prisma.course.findMany({
            where: {
                learningPaths: {
                    none: { learningPathId: pathId }
                }
            },
            select: { id: true, title: true, published: true }
        });
        return courses;
    } catch (error: unknown) {
        logger.error({ error }, "Failed to fetch available courses");
        throw new Error("Failed to fetch available courses");
    }
}
