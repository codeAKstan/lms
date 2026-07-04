import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-api";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
    try {
        const user = await requireApiAuth(req);

        const count = await prisma.notification.count({
            where: { userId: user.id, isRead: false },
        });

        return NextResponse.json({ unreadCount: count });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        logger.error({ error }, "Error fetching unread notifications count");
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
