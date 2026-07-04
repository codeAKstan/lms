import { logger } from '@/lib/logger';
import { NextResponse } from "next/server";
import { mux } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserWithRole } from "@/lib/auth-api";

export async function POST(req: Request) {
    try {
        // 1. Authenticate User and verify role
        const user = await getAuthenticatedUserWithRole(req);
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Only instructors and admins may generate Mux video upload URLs
        if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
            return new NextResponse("Forbidden: only instructors can upload videos", { status: 403 });
        }

        const { lessonId } = await req.json().catch(() => ({})); // Allow empty body

        // 2. If lessonId is provided, verify ownership and clear old assets
        if (lessonId) {
            const lesson = await prisma.lesson.findUnique({
                where: { id: lessonId },
                include: { module: { include: { course: true } } }
            });

            if (!lesson) {
                return new NextResponse("Lesson not found", { status: 404 });
            }

            if (lesson.module.course.instructorId !== user.id) {
                return new NextResponse("Forbidden: you do not own this lesson", { status: 403 });
            }

            if (lesson.muxAssetId) {
                try {
                    await mux.video.assets.delete(lesson.muxAssetId);
                } catch (err) {
                    logger.error({ error: err }, "Failed to delete old Mux asset:");
                }
            }
        }

        // 3. Request Direct Upload URL from Mux
        const upload = await mux.video.uploads.create({
            cors_origin: process.env.NEXT_PUBLIC_APP_URL || "https://cth-lms.vercel.app",
            new_asset_settings: {
                playback_policy: ["signed"],
                passthrough: lessonId ? JSON.stringify({ lessonId }) : JSON.stringify({ pending: true }),
            },
        });

        // 4. If we have a lessonId, save the Mux Upload ID to our database immediately
        if (lessonId) {
            await prisma.lesson.update({
                where: { id: lessonId },
                data: { muxUploadId: upload.id },
            });
        }

        // 5. Return the secure upload URL to the frontend
        return NextResponse.json({ uploadUrl: upload.url, uploadId: upload.id });

    } catch (error) {
        logger.error({ error }, '');
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
