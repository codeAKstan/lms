"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStudentCalendarSessions } from "@/actions/student/calendar";
import { Calendar as CalendarIcon, Clock, Video, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionInfo {
    id: string;
    title: string;
    date: string;
    duration: number;
    meetingUrl: string | null;
    courseTitle: string;
    category: string | null;
    instructor: string;
}

export default function StudentCalendarPage() {
    const [sessions, setSessions] = useState<SessionInfo[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Authenticate user to fetch proper calendar events
        supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
            if (data.user) {
                setUserId(data.user.id);
            } else {
                window.location.href = "/login";
            }
        });
    }, []);

    useEffect(() => {
        if (!userId) return;

        const loadCalendar = async () => {
            setIsLoading(true);
            const res = await getStudentCalendarSessions(userId);
            if (res.success && res.sessions) {
                setSessions(res.sessions);
            }
            setIsLoading(false);
        };

        loadCalendar();
    }, [userId]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <CalendarIcon className="w-8 h-8 text-primary" />
                    My Calendar
                </h1>
                <p className="text-muted-foreground mt-2">
                    View upcoming live sessions, Q&As, and office hours across all your enrolled courses.
                </p>
            </div>

            {/* List View */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Upcoming Schedule</h3>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        Syncing your calendar...
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <CalendarIcon className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-1">Your schedule is clear!</h4>
                        <p className="text-gray-500 mb-6 max-w-sm">There are no upcoming live sessions scheduled by your instructors right now.</p>
                        <Button variant="outline" onClick={() => window.location.href = "/student/dashboard"}>
                            Return to Dashboard
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {sessions.map((session) => {
                            const dateObj = new Date(session.date);
                            const dayPart = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                            const timePart = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                            const isPast = dateObj < new Date();

                            return (
                                <div key={session.id} className={`p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 transition-colors ${isPast ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>

                                    {/* Date Column Sidebar (Desktop) */}
                                    <div className="hidden md:flex flex-col items-center justify-center bg-blue-50/50 text-primary rounded-xl w-24 h-24 flex-shrink-0 border border-blue-100">
                                        <span className="text-sm font-bold uppercase tracking-wider">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="text-3xl font-black">{dateObj.getDate()}</span>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                {session.category}
                                            </span>
                                            {isPast && (
                                                <span className="text-xs font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Completed</span>
                                            )}
                                        </div>

                                        <h4 className="font-bold text-gray-900 text-xl mb-1">{session.title}</h4>
                                        <p className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-1.5">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            {session.courseTitle} <span className="text-gray-300 mx-1">•</span> {session.instructor}
                                        </p>

                                        {/* Meta grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-primary" />
                                                <span className="md:hidden font-semibold">{dayPart}</span>
                                                <span className="hidden md:inline">{dayPart}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-emerald-500" />
                                                <span>{timePart} ({session.duration} mins)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[140px]">
                                        {session.meetingUrl ? (
                                            <Button
                                                variant={isPast ? "outline" : "primary"}
                                                className="w-full justify-start md:justify-center group"
                                                onClick={() => window.open(session.meetingUrl!, '_blank')}
                                            >
                                                <Video className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                                {isPast ? "Recording" : "Join Session"}
                                            </Button>
                                        ) : (
                                            <div className="text-xs text-gray-400 font-medium px-3 py-2 bg-gray-50 rounded-lg text-center border border-gray-100">
                                                Link TBA via Instructor
                                            </div>
                                        )}
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
