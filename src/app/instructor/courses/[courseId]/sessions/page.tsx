"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Calendar as CalendarIcon, Clock, Trash2, Video, Globe } from "lucide-react";
import { Button } from "@/components/ui";
import { getLiveSessions, createLiveSession, deleteLiveSession } from "@/actions/instructor/sessions";
import { toast } from "sonner"; // Assuming sonner is used for toasts, if not, change
import { useParams } from "next/navigation";

export default function CourseSessionsPage() {
    const params = useParams();
    const courseId = params.courseId as string;

    const [sessions, setSessions] = useState<{ id: string; title: string; date: Date; duration: number; meetingUrl: string | null }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form inputs
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState(60);
    const [meetingUrl, setMeetingUrl] = useState("");

    const loadSessions = useCallback(async () => {
        setIsLoading(true);
        const res = await getLiveSessions(courseId);
        if (res.success && res.sessions) {
            setSessions(res.sessions);
        } else {
            toast.error("Failed to load sessions");
        }
        setIsLoading(false);
    }, [courseId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is a standard pattern
        void loadSessions();
    }, [loadSessions]);

    async function handleAddSession(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        // Combine date and time
        const combinedDateTime = new Date(`${date}T${time}`);

        const res = await createLiveSession({
            title,
            date: combinedDateTime,
            duration: Number(duration),
            meetingUrl,
            courseId
        });

        if (res.success) {
            toast.success("Live session scheduled!");
            setShowForm(false);
            // Reset form
            setTitle("");
            setDate("");
            setTime("");
            setDuration(60);
            setMeetingUrl("");
            // Reload list
            loadSessions();
        } else {
            toast.error(res.error || "Failed to schedule session");
        }

        setIsSubmitting(false);
    }

    async function handleDelete(sessionId: string) {
        if (!confirm("Are you sure you want to delete this session?")) return;

        const res = await deleteLiveSession(sessionId, courseId);
        if (res.success) {
            toast.success("Session deleted");
            loadSessions();
        } else {
            toast.error(res.error || "Failed to delete session");
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Live Sessions</h2>
                    <p className="text-gray-500 mt-1">Schedule and manage live classes or office hours for this course.</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Schedule Session
                    </Button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-semibold mb-4">New Live Session</h3>
                    <form onSubmit={handleAddSession} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Session Title *</label>
                            <input
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                placeholder="e.g. Weekly Q&A, Module 1 Kickoff"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input
                                    required
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                                <input
                                    required
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                                <input
                                    required
                                    type="number"
                                    min="15"
                                    step="15"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full px-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (Zoom, Meet, etc.)</label>
                            <input
                                type="url"
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                placeholder="https://zoom.us/j/..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Scheduling..." : "Schedule Session"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Scheduled Sessions</h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <CalendarIcon className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-1">No sessions scheduled</h4>
                        <p className="text-gray-500 mb-6 max-w-sm">Create live sessions, office hours, or Q&A meetings to engage directly with your students.</p>
                        {!showForm && (
                            <Button onClick={() => setShowForm(true)} variant="outline">
                                Schedule First Session
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {sessions.map((session) => {
                            const dateObj = new Date(session.date);
                            const dayPart = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                            const timePart = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                            // Check if past
                            const isPast = dateObj < new Date();

                            return (
                                <div key={session.id} className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isPast ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg flex-shrink-0 ${isPast ? 'bg-gray-200 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-900 text-lg">{session.title}</h4>
                                                {isPast && (
                                                    <span className="text-[10px] font-bold uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Passed</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {dayPart}
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Clock className="w-4 h-4" />
                                                    {timePart} • {session.duration} mins
                                                </div>
                                                {session.meetingUrl && (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Globe className="w-4 h-4" />
                                                        <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                                                            {new URL(session.meetingUrl).hostname.replace('www.', '')} link
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center self-end md:self-auto gap-2">
                                        {/* You can add an edit button here if needed */}
                                        <Button
                                            variant="ghost"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(session.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
