"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Clock, Award, Target } from "lucide-react";
import Link from "next/link";
import { getStudentProgressData } from "@/actions/student/progress";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface CourseProgressData {
    id: string;
    title: string;
    timeSpent: number;
    progress: number;
    quizzesPassed?: number;
    totalQuizzes?: number;
}

interface ProgressStats {
    totalTimeSpentHours: number;
    coursesCompletedCount: number;
    averageCompletionPercent: number;
    coursesWithProgress: CourseProgressData[];
    currentStreakDays?: number;
}

export default function ProgressPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Default zero-states pending DB arrival
    const [stats, setStats] = useState<ProgressStats>({
        totalTimeSpentHours: 0,
        coursesCompletedCount: 0,
        averageCompletionPercent: 0,
        coursesWithProgress: [],
        currentStreakDays: 0
    });

    useEffect(() => {
        supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
            if (data.user) {
                setUserId(data.user.id);
            } else {
                window.location.href = "/login";
            }
        });
    }, []);

    useEffect(() => {
        if (!userId) return;

        async function fetchProgress() {
            setIsLoading(true);
            const res = await getStudentProgressData(userId!);
            if (res.success && res.data) {
                setStats(res.data);
            }
            setIsLoading(false);
        }

        fetchProgress();
    }, [userId]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
                <p className="text-muted-foreground">
                    Track your true learning journey and achievements
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    icon={<TrendingUp className="w-5 h-5 text-primary" />}
                    label="Avg. Completion"
                    value={isLoading ? "..." : `${stats.averageCompletionPercent}%`}
                />
                <StatCard
                    icon={<Clock className="w-5 h-5 text-secondary" />}
                    label="Total Time Learned"
                    value={isLoading ? "..." : `${stats.totalTimeSpentHours} hrs`}
                />
                <StatCard
                    icon={<Award className="w-5 h-5 text-success" />}
                    label="Courses Completed"
                    value={isLoading ? "..." : `${stats.coursesCompletedCount}`}
                />
                <StatCard
                    icon={<Target className="w-5 h-5 text-accent" />}
                    label="Current Streak"
                    value={isLoading ? "..." : `${stats.currentStreakDays ?? 0} days`}
                />
            </div>

            {/* Course Progress Details */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-10">
                    Course-by-Course Progress
                </h2>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : stats.coursesWithProgress.length === 0 ? (
                    <div className="text-center bg-white p-12 rounded-2xl border border-gray-100 shadow-sm">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Progress Yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven&apos;t enrolled in or started progressing on any courses yet.</p>
                        <Link href="/courses" className="text-primary hover:underline font-medium">Browse courses to start learning &rarr;</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {stats.coursesWithProgress.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between mb-5 gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                                            {course.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.timeSpent} hrs spent</span>
                                            {/* Quiz data is hidden or hardcoded until quiz sub-system is hooked up globally */}
                                            {/* <span className="flex items-center gap-1.5"><ExternalLink className="w-4 h-4"/> {course.quizzesPassed}/{course.totalQuizzes} quizzes passing</span> */}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/courses/${course.id}/learn`} // Placeholder standard route
                                        className="inline-flex justify-center items-center px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                                    >
                                        {course.progress === 100 ? "Review Material" : "Continue"}
                                    </Link>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Completion Status</span>
                                        <span className={`font-bold ${course.progress === 100 ? "text-success" : "text-primary"}`}>
                                            {course.progress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${course.progress === 100
                                                ? "bg-success"
                                                : "bg-primary"
                                                }`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Certificate Lock/Unlock Condition */}
                                {course.progress === 100 && (
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <Link
                                            href={`/student/certificates/${course.id}`}
                                            className="inline-flex items-center justify-center w-full md:w-auto px-4 py-2 bg-success/10 text-success hover:bg-success/20 rounded-xl gap-2 font-semibold transition-colors"
                                        >
                                            <Award className="w-5 h-5" />
                                            Claim / View Certificate
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-white p-6 rounded-xl border border-muted">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
    );
}
