"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, MessageSquare, Send, ChevronLeft, Pin } from "lucide-react";
import Image from "next/image";

interface ForumAuthor {
    id: string;
    name: string;
    avatar: string | null;
}

interface ForumReply {
    id: string;
    content: string;
    createdAt: string;
    author: ForumAuthor;
}

interface ForumTopic {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    author: ForumAuthor;
    replies: ForumReply[];
}

const fetcher = (url: string, token: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

export default function ForumView({ courseId }: { courseId: string }) {
    const { session } = useAuth();
    const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    
    // Form states
    const [newTopicTitle, setNewTopicTitle] = useState("");
    const [newTopicContent, setNewTopicContent] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: topics, error, mutate } = useSWR<ForumTopic[]>(
        session?.access_token ? `/api/courses/${courseId}/forum` : null,
        (url: string) => fetcher(url, session!.access_token)
    );

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicTitle.trim() || !newTopicContent.trim() || !session) return;
        
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/forum`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ title: newTopicTitle, content: newTopicContent })
            });

            if (res.ok) {
                setNewTopicTitle("");
                setNewTopicContent("");
                setIsCreatingTopic(false);
                mutate();
            }
        } catch (error) {
            console.error("Failed to create topic:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !session || !selectedTopic) return;
        
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/forum/${selectedTopic.id}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ content: replyContent })
            });

            if (res.ok) {
                const newReply = await res.json();
                
                // Optimistically update the selected topic
                setSelectedTopic(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        replies: [...prev.replies, newReply]
                    };
                });
                setReplyContent("");
                mutate(); // Refresh background data
            }
        } catch (error) {
            console.error("Failed to post reply:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) return <div className="p-6 text-red-500 bg-red-50 rounded-lg border border-red-100 mt-4">Failed to load forum.</div>;
    if (!topics) return (
        <div className="py-20 flex justify-center mt-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    // Format relative time (e.g. "2d ago")
    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        let interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    const UserAvatar = ({ author, className = "w-10 h-10" }: { author: ForumAuthor, className?: string }) => (
        <div className={`rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
            {author.avatar ? (
                <Image src={author.avatar} alt={author.name} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
                <span className="text-gray-500 font-medium text-sm">{author.name.charAt(0).toUpperCase()}</span>
            )}
        </div>
    );

    // Topic Detail View
    if (selectedTopic) {
        return (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50 sticky top-0 z-10">
                    <button 
                        onClick={() => setSelectedTopic(null)}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Topics
                    </button>
                </div>

                <div className="p-6 border-b border-gray-100">
                    <div className="flex gap-4">
                        <UserAvatar author={selectedTopic.author} className="w-12 h-12" />
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                {selectedTopic.isPinned && <Pin className="w-4 h-4 text-primary" />}
                                {selectedTopic.title}
                            </h2>
                            <div className="flex items-center text-xs text-gray-500 mb-4">
                                <span className="font-medium text-gray-700">{selectedTopic.author.name}</span>
                                <span className="mx-2">•</span>
                                <span>{getTimeAgo(selectedTopic.createdAt)}</span>
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-700">
                                {selectedTopic.content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2">{line}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50/50">
                    <div className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {selectedTopic.replies.length} Replies
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {selectedTopic.replies.map(reply => (
                            <div key={reply.id} className="p-6 flex gap-4">
                                <UserAvatar author={reply.author} />
                                <div className="flex-1">
                                    <div className="flex items-center text-xs text-gray-500 mb-2">
                                        <span className="font-medium text-gray-900">{reply.author.name}</span>
                                        <span className="mx-2">•</span>
                                        <span>{getTimeAgo(reply.createdAt)}</span>
                                    </div>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {reply.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white border-t border-gray-200">
                        <form onSubmit={handleCreateReply} className="flex gap-4">
                            <div className="flex-1">
                                <textarea
                                    className="w-full text-sm border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow min-h-[100px]"
                                    placeholder="Write your reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !replyContent.trim()}
                                className="self-end px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Reply
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Creating Topic View
    if (isCreatingTopic) {
        return (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Start a New Discussion</h2>
                    <button 
                        onClick={() => setIsCreatingTopic(false)}
                        className="text-sm text-gray-500 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                </div>
                <form onSubmit={handleCreateTopic} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            placeholder="What's on your mind?"
                            value={newTopicTitle}
                            onChange={(e) => setNewTopicTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                        <textarea
                            className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            placeholder="Provide more details to get better answers..."
                            value={newTopicContent}
                            onChange={(e) => setNewTopicContent(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !newTopicTitle.trim() || !newTopicContent.trim()}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] transition-all disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Post Topic
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // List Topics View
    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Course Discussion</h2>
                <button
                    onClick={() => setIsCreatingTopic(true)}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <MessageSquare className="w-4 h-4" />
                    New Topic
                </button>
            </div>

            {topics.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">No discussions yet</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                        Have a question or want to share something? Be the first to start a discussion.
                    </p>
                    <button
                        onClick={() => setIsCreatingTopic(true)}
                        className="text-primary font-medium text-sm hover:underline"
                    >
                        Start the first discussion
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {topics.map(topic => (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                className="w-full text-left p-5 hover:bg-gray-50 transition-colors flex gap-4 group"
                            >
                                <UserAvatar author={topic.author} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-1 group-hover:text-primary transition-colors">
                                                {topic.isPinned && <Pin className="w-4 h-4 text-primary" />}
                                                {topic.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                                                {topic.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            {topic.replies.length}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400">
                                        <span className="font-medium text-gray-600">{topic.author.name}</span>
                                        <span className="mx-2">•</span>
                                        <span>{getTimeAgo(topic.createdAt)}</span>
                                        {topic.replies.length > 0 && (
                                            <>
                                                <span className="mx-2">•</span>
                                                <span className="truncate">Last reply {getTimeAgo(topic.replies[topic.replies.length - 1].createdAt)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
