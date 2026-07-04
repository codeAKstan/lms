import { logger } from '@/lib/logger'
import { NextResponse } from "next/server";
import { mux } from "@/lib/mux";
import { getAuthenticatedUser } from "@/lib/auth-api";

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { playbackId } = await req.json();

        if (!playbackId) {
            return new NextResponse("Missing playback ID", { status: 400 });
        }

        // Generate a 12-hour signed token for playback
        const token = mux.jwt.signPlaybackId(playbackId, {
            type: "video",
            expiration: "12h"
        });

        // Generate a separate 12-hour signed token for the storyboard (thumbnail preview on scrub)
        const storyboardToken = mux.jwt.signPlaybackId(playbackId, {
            type: "storyboard",
            expiration: "12h"
        });

        return NextResponse.json({ token, storyboardToken });

    } catch (error) {
        logger.error({ error }, '');
        return new NextResponse("Internal Error", { status: 500 });
    }
}


