"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { syncAllCoursesToAlgolia } from "@/lib/algolia-sync";

export type CourseResult = {
    id: string;
    title: string;
    instructor: string;
    instructorId: string;
    status: "published" | "pending"; // mapped from `published` boolean
    students: number;
    revenue: number; // estimated
    submittedDate: Date; // using createdAt for now
    price: number;
    slug: string;
};

type GetCoursesParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "published" | "pending";
};

export async function getCourses({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
}: GetCoursesParams) {
    noStore();
    await requireRole('ADMIN');
    try {
        const skip = (page - 1) * limit;

        const where: Prisma.CourseWhereInput = {
            AND: [
                search
                    ? {
                        OR: [
                            { title: { contains: search, mode: "insensitive" } },
                            { instructor: { name: { contains: search, mode: "insensitive" } } },
                        ],
                    }
                    : {},
                status !== "all"
                    ? {
                        published: status === "published",
                    }
                    : {},
                {
                    deletedAt: null, // SOFT DELETE: Filter out deleted courses
                }
            ],
        };

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    published: true,
                    price: true,
                    studentCount: true,
                    createdAt: true,
                    instructorId: true,
                    slug: true,
                    instructor: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.course.count({ where }),
        ]);

        const formattedCourses: CourseResult[] = courses.map((course) => ({
            id: course.id,
            title: course.title,
            instructor: course.instructor.name,
            instructorId: course.instructorId,
            status: course.published ? "published" : "pending",
            students: course.studentCount,
            revenue: course.studentCount * course.price,
            submittedDate: course.createdAt,
            price: course.price,
            slug: course.slug,
        }));

        return {
            courses: formattedCourses,
            total,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw new Error("Failed to fetch courses");
    }
}

import { EmailService } from "@/lib/email";

export async function updateCourseStatus(courseId: string, published: boolean) {
    await requireRole('ADMIN');
    try {
        const course = await prisma.course.update({
            where: { id: courseId },
            data: { published },
            include: { instructor: true }
        });
        
        // Notify Instructor if the course was published
        if (published && course.instructor) {
            try {
                // 1. In-App Notification
                await prisma.notification.create({
                    data: {
                        userId: course.instructorId,
                        type: "SYSTEM_ALERT",
                        title: "Course Approved & Published!",
                        message: `Congratulations! Your course "${course.title}" has been approved by the administration and is now live on the platform.`,
                        linkUrl: `/instructor/courses`
                    }
                });

                // 2. Email Notification
                await EmailService.send({
                    to: course.instructor.email,
                    subject: "Your Course is Live! - CTH EdTech",
                    html: `
                        <h2>Course Approved!</h2>
                        <p>Hi <strong>${course.instructor.name || "Instructor"}</strong>,</p>
                        <p>Great news! Your course <strong>"${course.title}"</strong> has been reviewed and approved by our administration.</p>
                        <p>It is now officially published and available for students to enroll.</p>
                        <br/>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://cthedtech.com"}/courses/${course.slug}">View Your Course</a>
                        <p>Thank you for contributing to Clean Tech Hub!</p>
                    `
                });
            } catch (notifError) {
                console.error("Failed to notify instructor of course approval:", notifError);
            }
        }

        // Sync Algolia so search page reflects the new status instantly
        await syncAllCoursesToAlgolia();

        revalidatePath("/admin/courses");
        return { success: true };
    } catch (error) {
        console.error("Error updating course status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function deleteCourse(courseId: string) {
    await requireRole('ADMIN');
    try {
        // SOFT DELETE: We update the deletedAt column instead of actually deleting the record.
        // This preserves Enrollments, Payments, and Certificates associated with this course.
        await prisma.course.update({
            where: { id: courseId },
            data: {
                deletedAt: new Date(),
                published: false // Unpublish it just to be safe
            },
        });
        
        // Sync Algolia so search page reflects the deletion instantly
        await syncAllCoursesToAlgolia();

        revalidatePath("/admin/courses");
        return { success: true };
    } catch (error) {
        console.error("Error soft-deleting course:", error);
        return { success: false, error: "Failed to delete course" };
    }
}
