import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> } // Fix: await params for Next.js 15
) {
    try {
        const { lessonId } = await params;
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const comments = await prisma.comment.findMany({
            where: {
                lessonId: lessonId,
                parentId: null, // Fetch top-level comments only (replies included via relation)
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                        role: true,
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                avatar: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        logger.error({ error }, "[COMMENTS_GET]");
        return new NextResponse("Internal Error", { status: 500 });
    }
}
