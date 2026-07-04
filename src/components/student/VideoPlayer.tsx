"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
    videoUrl?: string | null; // Legacy YouTube or raw MP4 URL
    muxPlaybackId?: string | null; // Enterprise Mux Stream ID
    onProgress?: (currentTime: number) => void;
    onComplete?: () => void;
}

export default function VideoPlayer({ videoUrl, muxPlaybackId, onProgress, onComplete }: VideoPlayerProps) {
    const [muxToken, setMuxToken] = useState<string | null>(null);
    const [muxStoryboardToken, setMuxStoryboardToken] = useState<string | null>(null);
    const [isLoadingMux, setIsLoadingMux] = useState(!!muxPlaybackId);

    // If we have a Mux Playback ID, fetch the secure signed JWTs for playback
    useEffect(() => {
        if (!muxPlaybackId) return;

        async function fetchTokens() {
            try {
                const res = await fetch("/api/mux/sign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ playbackId: muxPlaybackId })
                });

                if (res.ok) {
                    const data = await res.json();
                    setMuxToken(data.token);
                    setMuxStoryboardToken(data.storyboardToken);
                }
            } catch (err) {
                console.error("Failed to fetch Mux tokens", err);
            } finally {
                setIsLoadingMux(false);
            }
        }

        fetchTokens();
    }, [muxPlaybackId]);

    // 1. Enterprise Mux Player Rendering
    if (muxPlaybackId) {
        if (isLoadingMux) {
            return (
                <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            );
        }

        return (
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                <MuxPlayer
                    playbackId={muxPlaybackId}
                    tokens={{ playback: muxToken || undefined, thumbnail: muxStoryboardToken || undefined, storyboard: muxStoryboardToken || undefined }}
                    envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
                    metadata={{
                        video_id: muxPlaybackId,
                        video_title: "Clean Tech Hub Lesson",
                        player_name: "React Mux Player"
                    }}
                    streamType="on-demand"
                    className="w-full h-full"
                    primaryColor="#059669" // Tailwind Emerald-600
                    secondaryColor="#ffffff"
                    onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        if (onProgress) onProgress(video.currentTime);

                        // Auto-complete if > 90% watched
                        if (onComplete && video.duration > 0 && (video.currentTime / video.duration) > 0.9) {
                            onComplete();
                        }
                    }}
                    onEnded={() => {
                        if (onComplete) onComplete();
                    }}
                />
            </div>
        );
    }

    // Extract YouTube video ID from URL
    const getYouTubeId = (url: string | null | undefined) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&]+)/);
        return match ? match[1] : null;
    };

    const videoId = getYouTubeId(videoUrl);

    // 2. Fallback YouTube iframe
    if (videoId) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title="Lesson video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    // 3. Fallback Raw HTML5 Video tag
    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <video
                className="w-full h-full"
                controls
                src={videoUrl || undefined}
                onTimeUpdate={(e) => {
                    const video = e.currentTarget;
                    if (onProgress) onProgress(video.currentTime);

                    // Auto-complete if > 90% watched
                    if (onComplete && video.duration > 0 && (video.currentTime / video.duration) > 0.9) {
                        onComplete();
                    }
                }}
                onEnded={() => {
                    if (onComplete) onComplete();
                }}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
