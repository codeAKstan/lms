import { logger } from '@/lib/logger'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-api";
import { reviewCreateSchema } from "@/lib/validations";

export async function POST(req: Request) {
    try {
        const authUser = await getAuthenticatedUser(req);

        if (!authUser) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const parsed = reviewCreateSchema.safeParse(body);
        if (!parsed.success) {
            return new NextResponse("Invalid input", { status: 400 });
        }
        const { courseId, rating, comment } = parsed.data;

        // Check enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: authUser.id,
                    courseId: courseId,
                },
            },
        });

        if (!enrollment) {
            return new NextResponse("You must be enrolled to review this course", { status: 403 });
        }

        // Upsert review
        const review = await prisma.review.upsert({
            where: {
                userId_courseId: {
                    userId: authUser.id,
                    courseId: courseId,
                },
            },
            update: {
                rating,
                comment,
            },
            create: {
                userId: authUser.id,
                courseId,
                rating,
                comment,
            },
        });

        // Recalculate average rating
        const allReviews = await prisma.review.findMany({
            where: { courseId }
        });
        
        if (allReviews.length > 0) {
            const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
            const average = sum / allReviews.length;
            
            await prisma.course.update({
                where: { id: courseId },
                data: { rating: average }
            });
        }

        return NextResponse.json(review);
    } catch (error) {
        logger.error({ error }, '');
        return new NextResponse("Internal Error", { status: 500 });
    }
}
