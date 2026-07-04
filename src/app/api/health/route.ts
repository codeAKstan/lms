import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const timestamp = new Date().toISOString();

    try {
        // Verify database connectivity
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: "ok",
            timestamp,
        });
    } catch {
        return NextResponse.json(
            {
                status: "degraded",
                timestamp,
            },
            { status: 503 }
        );
    }
}
