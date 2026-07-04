"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, MessageCircle, Send, Reply, User } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        name: string;
        avatar?: string; // or null, depending on your backend
    };
    replies?: Comment[];
}

interface DiscussionTabProps {
    lessonId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DiscussionTab({ lessonId }: DiscussionTabProps) {
    const { user } = useAuth();
    const { data: comments, isLoading } = useSWR(
        `/api/lessons/${lessonId}/comments`,
        fetcher
    );
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (parentId: string | null = null) => {
        const content = parentId ? replyContent : newComment;
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId,
                    content,
                    parentId,
                }),
            });

            if (!res.ok) throw new Error("Failed to post comment");

            setNewComment("");
            setReplyContent("");
            setReplyingTo(null);
            mutate(`/api/lessons/${lessonId}/comments`); // Refresh list
            toast.success("Comment posted!");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* New Comment Input */}
            <div className="bg-gray-50 p-4 rounded-lg flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border font-bold text-gray-400 flex-shrink-0">
                    {user?.user_metadata?.avatar_url ? (
                        <Image src={user.user_metadata.avatar_url} alt="Me" width={40} height={40} className="rounded-full object-cover" />
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                </div>
                <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question or share your thoughts..."
                        className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => handleSubmit(null)}
                            disabled={isSubmitting || !newComment.trim()}
                            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Post Comment
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No comments yet. Be the first to start the discussion!</p>
                    </div>
                ) : (
                    comments?.map((comment: Comment) => (
                        <div key={comment.id} className="group">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0 text-sm overflow-hidden">
                                    {comment.user?.avatar ? (
                                        <Image src={comment.user.avatar} alt={comment.user.name} width={40} height={40} className="object-cover" />
                                    ) : (
                                        comment.user?.name?.[0] || "?"
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-sm text-gray-900">{comment.user?.name || "User"}</h4>
                                                <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                                        <button
                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                            className="mt-3 text-xs font-medium text-gray-500 hover:text-primary flex items-center gap-1"
                                        >
                                            <Reply className="w-3 h-3" /> Reply
                                        </button>
                                    </div>

                                    {/* Reply Input */}
                                    {replyingTo === comment.id && (
                                        <div className="mt-3 ml-4 flex gap-3">
                                            <div className="flex-1">
                                                <textarea
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="Write a reply..."
                                                    className="w-full p-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    rows={2}
                                                />
                                                <div className="flex justify-end mt-2 gap-2">
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="text-xs text-gray-500 hover:text-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSubmit(comment.id)}
                                                        disabled={isSubmitting || !replyContent.trim()}
                                                        className="bg-primary text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? "..." : "Reply"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100 ml-5">
                                            {comment.replies?.map((reply: Comment) => (
                                                <div key={reply.id} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0 text-xs overflow-hidden">
                                                        {reply.user?.avatar ? (
                                                            <Image src={reply.user.avatar} alt={reply.user.name} width={32} height={32} className="object-cover" />
                                                        ) : (
                                                            reply.user?.name?.[0] || "?"
                                                        )}
                                                    </div>
                                                    <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-semibold text-xs text-gray-900">{reply.user?.name}</span>
                                                            <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(reply.createdAt))} ago</span>
                                                        </div>
                                                        <p className="text-gray-700 text-xs leading-relaxed">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
