"use client";

import { useState } from "react";
import { Star, MessageSquarePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ReviewDialog({ courseId, onSuccess }: { courseId: string; onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId, rating, comment })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit review");
            }

            toast.success("Thank you for your review!");
            setIsOpen(false);
            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to submit review";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
                <MessageSquarePlus className="w-4 h-4" /> Leave a Review
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Review this Course</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <p className="text-sm font-medium text-gray-500">How would you rate your experience?</p>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star 
                                        className={`w-10 h-10 transition-colors ${
                                            star <= (hoverRating || rating) 
                                            ? "fill-[#ffcc00] text-[#ffcc00]" 
                                            : "fill-gray-100 text-gray-200"
                                        }`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Written Review */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Write your review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            placeholder="Tell us what you liked about the course, or what could be improved..."
                            className="w-full border border-gray-200 rounded-xl p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#006a6a] text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || rating === 0 || !comment}
                        className="w-full py-3 bg-[#00153e] text-white font-bold rounded-xl hover:bg-[#002b80] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                        ) : (
                            "Submit Review"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
