"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { EmailService } from "@/lib/email";
import { syncAllCoursesToAlgolia } from "@/lib/algolia-sync";

export type CreateCourseInput = {
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail?: string;
    price: number;
    // Phase 1 Enhanced Fields
    difficulty?: string;
    totalHours?: number;
    lectures?: number;
    resourcesCount?: number;
    originalPrice?: number;
    learningOutcomes?: string[];

    modules: {
        title: string;
        lessons: {
            title: string;
            type: "video" | "text" | "quiz";
            content?: string; // For text
            videoUrl?: string; // Legacy URL
            muxAssetId?: string; // Mux Asset tracking
            muxPlaybackId?: string; // Secure HLS Streaming ID
            muxUploadId?: string; // Pending Direct Upload Tracker
            duration?: number;
            isFree?: boolean;
        }[];
    }[];
    instructorId: string;
};

export async function createCourse(data: CreateCourseInput) {
    try {
        // Create Course
        const course = await prisma.course.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                level: data.level,
                thumbnail: data.thumbnail,
                price: data.price,
                instructorId: data.instructorId,
                slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),

                // Enhanced Fields
                difficulty: data.difficulty || "Beginner",
                totalHours: data.totalHours || 0,
                lectures: data.lectures || 0,
                resourcesCount: data.resourcesCount || 0,
                originalPrice: data.originalPrice,
                learningOutcomes: data.learningOutcomes || [],

                // status field doesn't exist in schema, defaulting to published=false is standard or we can explicit it
                published: false,
                modules: {
                    create: data.modules.map((mod, index) => ({
                        title: mod.title,
                        position: index,
                        lessons: {
                            create: mod.lessons.map((lesson, lIndex) => ({
                                title: lesson.title,
                                // type field doesn't exist in schema currently, it's inferred by content presence
                                // type: lesson.type,
                                // Use generic 'content' field for videoUrl if type is video, or just separate fields
                                // Prisma schema probably has specific fields or a JSON 'content'
                                // Let's check schema. Assuming generic structure or we map it.
                                videoUrl: lesson.videoUrl,
                                muxAssetId: lesson.muxAssetId,
                                muxPlaybackId: lesson.muxPlaybackId,
                                muxUploadId: lesson.muxUploadId,
                                content: lesson.content,
                                position: lIndex,
                                duration: lesson.duration || 0,
                                isFree: lesson.isFree || false
                            }))
                        }
                    }))
                }
            },
            include: {
                modules: {
                    include: {
                        lessons: true
                    }
                }
            }
        });

        // NOTIFY ADMINS
        try {
            const admins = await prisma.user.findMany({
                where: { role: "ADMIN" }
            });

            if (admins.length > 0) {
                // In-App Notification
                await prisma.notification.createMany({
                    data: admins.map(admin => ({
                        userId: admin.id,
                        type: "SYSTEM_ALERT",
                        title: "New Course Uploaded",
                        message: `A new course "${data.title}" has been created and is awaiting review or publication.`,
                        linkUrl: `/admin/courses`
                    }))
                });

                // Email Notification
                const adminEmails = admins.map(a => a.email);
                const instructor = await prisma.user.findUnique({ where: { id: data.instructorId } });
                await EmailService.send({
                    to: adminEmails,
                    subject: "New Course Uploaded - CTH EdTech",
                    html: `
                        <h2>New Course Alert</h2>
                        <p>A new course has been created on the platform by <strong>${instructor?.name || "an instructor"}</strong>.</p>
                        <p><strong>Course Title:</strong> ${data.title}</p>
                        <p>Please log in to the admin dashboard to review and manage this course.</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cthedtech.com"}/admin/courses">View in Dashboard</a>
                    `
                });
            }
        } catch (notifError) {
            console.error("Failed to notify admins:", notifError);
            // Non-blocking error, so we continue
        }

        revalidatePath("/instructor/courses");
        return { success: true, courseId: course.id };
    } catch (error: unknown) {
        console.error("Failed to create course:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return { success: false, error: message };
    }
}

export async function getCourseForEdit(courseId: string) {
    noStore();
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    orderBy: { position: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { position: 'asc' },
                            include: { quizzes: true }
                        }
                    }
                }
            }
        });

        if (!course) {
            return { success: false, error: "Course not found" };
        }

        return { success: true, course };
    } catch (error: unknown) {
        console.error("Failed to fetch course:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

export type UpdateCourseInput = {
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail?: string;
    price: number;
    difficulty?: string;
    totalHours?: number;
    lectures?: number;
    resourcesCount?: number;
    originalPrice?: number;
    learningOutcomes?: string[];
    modules: {
        id?: string;
        title: string;
        lessons: {
            id?: string;
            title: string;
            type: "video" | "text" | "quiz";
            content?: string;
            videoUrl?: string;
            muxAssetId?: string;
            muxPlaybackId?: string;
            muxUploadId?: string;
            duration?: number;
            isFree?: boolean;
        }[];
    }[];
};

export async function updateCourse(courseId: string, data: UpdateCourseInput) {
    try {
        await prisma.$transaction(async (tx) => {
            // Update base course info
            await tx.course.update({
                where: { id: courseId },
                data: {
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    level: data.level,
                    thumbnail: data.thumbnail,
                    price: data.price,
                    difficulty: data.difficulty,
                    totalHours: data.totalHours,
                    lectures: data.lectures,
                    resourcesCount: data.resourcesCount,
                    originalPrice: data.originalPrice,
                    learningOutcomes: data.learningOutcomes,
                }
            });

            if (data.modules && data.modules.length > 0) {
                // Determine module IDs to keep
                const incomingModuleIds = data.modules.filter(m => m.id && typeof m.id === "string").map(m => m.id as string);

                // Delete modules not in the incoming payload
                await tx.module.deleteMany({
                    where: {
                        courseId,
                        id: { notIn: incomingModuleIds }
                    }
                });

                // Upsert modules
                for (let i = 0; i < data.modules.length; i++) {
                    const modData = data.modules[i];

                    let moduleId = modData.id;
                    if (!moduleId || typeof moduleId !== "string") {
                        // Create module
                        const newMod = await tx.module.create({
                            data: {
                                title: modData.title,
                                position: i,
                                courseId: courseId
                            }
                        });
                        moduleId = newMod.id;
                    } else {
                        // Update module
                        await tx.module.update({
                            where: { id: moduleId },
                            data: { title: modData.title, position: i }
                        });
                    }

                    // Process lessons for this module
                    const incomingLessonIds = modData.lessons.filter(l => l.id && typeof l.id === "string").map(l => l.id as string);

                    // Delete removed lessons
                    await tx.lesson.deleteMany({
                        where: {
                            moduleId: moduleId,
                            id: { notIn: incomingLessonIds }
                        }
                    });

                    // Upsert lessons
                    for (let j = 0; j < modData.lessons.length; j++) {
                        const lessonData = modData.lessons[j];

                        if (!lessonData.id || typeof lessonData.id !== "string") {
                            // Create lesson
                            await tx.lesson.create({
                                data: {
                                    title: lessonData.title,
                                    position: j,
                                    moduleId: moduleId,
                                    videoUrl: lessonData.videoUrl,
                                    muxAssetId: lessonData.muxAssetId,
                                    muxPlaybackId: lessonData.muxPlaybackId,
                                    muxUploadId: lessonData.muxUploadId,
                                    content: lessonData.content,
                                    duration: lessonData.duration || 0,
                                    isFree: lessonData.isFree || false
                                }
                            });
                        } else {
                            // Update lesson
                            await tx.lesson.update({
                                where: { id: lessonData.id },
                                data: {
                                    title: lessonData.title,
                                    position: j,
                                    videoUrl: lessonData.videoUrl,
                                    muxAssetId: lessonData.muxAssetId,
                                    muxPlaybackId: lessonData.muxPlaybackId,
                                    muxUploadId: lessonData.muxUploadId,
                                    content: lessonData.content,
                                    duration: lessonData.duration || 0,
                                    isFree: lessonData.isFree || false
                                }
                            });
                        }
                    }
                }
            }
        });

        // Sync to Algolia so search page reflects any changes if this course is already published
        await syncAllCoursesToAlgolia();

        revalidatePath("/instructor/courses");
        revalidatePath(`/instructor/courses/${courseId}`);
        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to update course:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return { success: false, error: message };
    }
}

export async function getInstructorCourses(instructorId: string) {
    noStore();
    try {
        const courses = await prisma.course.findMany({
            where: { instructorId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                    }
                }
            }
        });

        return { success: true, courses };
    } catch (error) {
        console.error("Failed to fetch instructor courses:", error);
        return { success: false, error: "Failed to fetch courses" };
    }
}
