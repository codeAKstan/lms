import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-api";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
    try {
        const user = await requireApiAuth(req);
        const { searchParams } = new URL(req.url);
        const limitRes = parseInt(searchParams.get("limit") || "20", 10);
        const limit = isNaN(limitRes) ? 20 : limitRes;

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json(notifications);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        logger.error({ error }, "Error fetching notifications");
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await requireApiAuth(req);
        const body = await req.json();
        const { notificationId } = body;

        if (notificationId) {
            // Mark specific as read
            await prisma.notification.update({
                where: { id: notificationId, userId: user.id },
                data: { isRead: true },
            });
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        logger.error({ error }, "Error marking notifications as read");
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await requireApiAuth(req);

        // Delete all read notifications
        await prisma.notification.deleteMany({
            where: { userId: user.id, isRead: true },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        logger.error({ error }, "Error clearing read notifications");
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
