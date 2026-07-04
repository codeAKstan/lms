import { 
    BookOpen, 
    Clock, 
    TrendingUp, 
    Award, 
    ArrowRight, 
    Calendar, 
    CheckCircle2, 
    ChevronRight 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStudentDashboardData } from "@/actions/student/dashboard";
import { redirect } from "next/navigation";
import DashboardHeaderActions from "./DashboardHeaderActions.client";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { studentName, stats, courses, liveSessions, goal } = await getStudentDashboardData(user.id);

    // 1. Determine Current Course (Hero Section)
    const activeCourse = courses.length > 0 ? courses[0] : null;

    // 2. Setup Deadlines
    const dynamicDeadlines = liveSessions.map(session => {
        const d = new Date(session.date);
        return {
            id: session.id,
            title: session.title,
            meta: `Live Session • ${session.instructor}`,
            date: d,
            pillColor: "blue"
        };
    }).slice(0, 3);

    // 3. Setup Enrolled Courses Grid
    // Filter out the hero course if it's a real user course to avoid duplication
    const gridCourses = courses.slice(1);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-50">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#00153e] tracking-tight font-sans">
                        Welcome back, {(studentName || user.user_metadata?.full_name || user.user_metadata?.name || "Student").split(' ')[0]}!
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">
                        You&apos;re on track to complete {stats.certificates || 3} certifications this month.
                    </p>
                </div>
                <DashboardHeaderActions />
            </div>

            {/* Row 1: Hero Card + Deadlines Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hero Card (Current Course) - 2/3 width */}
                <div className="lg:col-span-2 bg-[#00153e] p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[350px] shadow-2xl border border-[#092962] group">
                    {/* Background Glowing Mesh Effects */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mb-20 pointer-events-none transition-transform duration-1000 group-hover:scale-105"></div>
                    
                    {/* Faint Wind Turbine SVG Graphic Overlay */}
                    <div className="absolute right-4 bottom-0 w-1/2 h-full opacity-10 pointer-events-none flex items-end justify-end">
                        <svg className="w-full h-4/5 text-white" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M50 10 L50 90 M50 20 L25 30 L50 20 L75 30 L50 20 L50 10 M50 35 L20 45 L50 35 L80 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="50" cy="20" r="3" />
                        </svg>
                    </div>

                    {activeCourse ? (
                        <>
                            {/* Top Content */}
                            <div className="space-y-4 relative z-10">
                                <span className="inline-flex items-center px-3 py-1 bg-white/10 text-white font-bold text-[10px] tracking-wider uppercase rounded-full w-fit">
                                    Current Course
                                </span>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight max-w-xl">
                                    {activeCourse.title}
                                </h2>
                                <p className="text-[#a4b4cb] text-sm font-medium max-w-lg line-clamp-2">
                                    {activeCourse.nextLesson}
                                </p>
                            </div>

                            {/* Bottom Progress & Button */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end pt-8 relative z-10 border-t border-white/5">
                                <div className="md:col-span-3 space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold tracking-wider text-[#a4b4cb] uppercase">
                                        <span>Progress</span>
                                        <span className="text-[#90efef]">{activeCourse.progress}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-[#90efef] h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(144,239,239,0.5)]"
                                            style={{ width: `${activeCourse.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Link href={`/courses/${activeCourse.slug}/learn`} className="w-full">
                                        <button className="w-full bg-[#f5d300] hover:bg-[#e6c400] text-[#00153e] hover:shadow-lg hover:-translate-y-[1px] active:scale-[0.98] transition-all font-extrabold text-sm py-3.5 px-6 rounded-xl cursor-pointer flex items-center justify-center gap-2">
                                            <span>Continue Learning</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                <BookOpen className="w-8 h-8 text-[#90efef]" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                                Ready to start learning?
                            </h2>
                            <p className="text-[#a4b4cb] text-sm font-medium max-w-md mx-auto">
                                You haven&apos;t enrolled in any courses yet. Browse our extensive catalog of clean tech courses to kickstart your journey.
                            </p>
                            <Link href="/courses" className="inline-block mt-4">
                                <button className="bg-[#f5d300] hover:bg-[#e6c400] text-[#00153e] hover:shadow-lg hover:-translate-y-[1px] active:scale-[0.98] transition-all font-extrabold text-sm py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 mx-auto">
                                    <span>Browse Courses</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Deadlines Card - 1/3 width */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
                            <h3 className="text-lg font-bold text-[#00153e] tracking-tight">Deadlines</h3>
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div className="space-y-4">
                            {dynamicDeadlines.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-sm font-medium text-gray-500">No upcoming deadlines.</p>
                                    <p className="text-xs text-gray-400 mt-1">You&apos;re all caught up!</p>
                                </div>
                            ) : (
                                dynamicDeadlines.map((deadline, idx) => {
                                    const month = deadline.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                                    const day = deadline.date.toLocaleDateString('en-US', { day: '2-digit' });
                                    
                                    // Color variants for date pills matching mockup
                                    const colors = [
                                        { bg: "bg-[#ffdbcc]", text: "text-[#723615]" }, // Red
                                        { bg: "bg-[#e6f1fb]", text: "text-[#0c447c]" }, // Blue
                                        { bg: "bg-[#faeeda]", text: "text-[#633806]" }  // Orange/Amber
                                    ];
                                    const color = colors[idx % colors.length];

                                    return (
                                        <div key={deadline.id} className="flex items-start gap-4 p-2 rounded-xl hover:bg-gray-50/50 transition-colors">
                                            <div className={`flex flex-col items-center justify-center rounded-xl w-14 h-14 flex-shrink-0 font-sans font-bold shadow-sm ${color.bg} ${color.text}`}>
                                                <span className="text-[10px] uppercase tracking-wider leading-none mb-1">{month}</span>
                                                <span className="text-lg leading-none">{day}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-[#00153e] text-sm line-clamp-1 leading-snug">{deadline.title}</h4>
                                                <p className="text-xs text-gray-400 mt-1 font-medium line-clamp-1">
                                                    {deadline.meta}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Goal Progress Strip */}
            <div className="bg-gradient-to-r from-[#faeeda] to-[#faeeda]/30 border border-[#faeeda]/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                        <Award className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Weekly Learning Goal</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Keep learning to achieve your clean-tech target!</p>
                    </div>
                </div>
                
                <div className="flex-1 md:max-w-md flex items-center gap-4">
                    <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-gray-600">
                            <span>{goal.currentHours}/{goal.targetHours} hours learned</span>
                            <span className="text-[#633806]">{Math.min(100, Math.round((goal.currentHours / goal.targetHours) * 100))}%</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-gray-100 shadow-inner">
                            <div 
                                className="bg-[#f5d300] h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(100, (goal.currentHours / goal.targetHours) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="text-right">
                        {goal.currentHours >= goal.targetHours ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 animate-pulse">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Goal Met!
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                In Progress
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<BookOpen className="w-5 h-5 text-[#0c447c]" />}
                    label="Enrolled Courses"
                    value={stats.enrolled.toString()}
                    iconBg="bg-[#e6f1fb]"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5 text-[#1b5936]" />}
                    label="Hours Learned"
                    value={stats.hoursLearned.toString()}
                    iconBg="bg-[#eaf3de]"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                    label="Completion Rate"
                    value={`${stats.avgCompletion}%`}
                    iconBg="bg-purple-50"
                />
                <StatCard
                    icon={<Award className="w-5 h-5 text-[#633806]" />}
                    label="Certificates"
                    value={stats.certificates.toString()}
                    iconBg="bg-[#faeeda]"
                />
            </div>

            {/* Row 3: Enrolled Courses Section */}
            <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-[#00153e] tracking-tight">Enrolled Courses</h2>
                    <Link 
                        href="/student/courses"
                        className="text-sm font-bold text-[#006a6a] hover:text-[#005757] hover:underline flex items-center gap-1 transition-colors"
                    >
                        <span>View All Courses</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {gridCourses.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xl">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-[#00153e] mb-2">No courses enrolled</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            You haven&apos;t enrolled in any other courses yet. Discover new topics to expand your clean tech knowledge.
                        </p>
                        <Link href="/courses">
                            <button className="bg-[#00153e] hover:bg-[#00153e]/90 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-md active:scale-95">
                                Explore Course Catalog
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {gridCourses.map((course, idx) => {
                            // Badge categorization based on mockup tags
                            const categoryTags = [
                                { label: course.category.toUpperCase() || "COURSE", bg: "bg-[#eaf3de] text-[#1b5936]" }
                            ];
                            const tag = categoryTags[idx % categoryTags.length];

                            // Set custom cover thumbnails matching high-fidelity cleanup images
                            const fallbackThumbnails = [
                                "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
                                "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
                                "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80"
                            ];
                            const courseImg = course.thumbnail || fallbackThumbnails[idx % fallbackThumbnails.length];

                            // Fake avatar rows for study group mockup visual parity
                            const avatarSeeds = [
                                ["Amina", "Kofi", "Zoe"],
                                ["John", "Zoe"],
                                ["Sara", "Ali", "Kofi"]
                            ];
                            const groupAvatars = avatarSeeds[idx % avatarSeeds.length];

                            return (
                                <div key={course.id} className="group bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:border-gray-200/60 hover:-translate-y-[2px] overflow-hidden flex flex-col justify-between transition-all duration-300">
                                    {/* Course Thumbnail Overlay */}
                                    <div className="h-44 relative w-full overflow-hidden bg-gray-100">
                                        <Image 
                                            src={courseImg} 
                                            alt={course.title} 
                                            fill 
                                            className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        
                                        {/* Category Chip overlay */}
                                        <div className="absolute top-4 left-4">
                                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider uppercase ${tag.bg}`}>
                                                {tag.label}
                                            </span>
                                        </div>
                                        
                                        {/* Almost done badge overlay */}
                                        {course.progress >= 80 && (
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-[#f5d300] text-[#00153e] text-[9px] font-extrabold px-2.5 py-1 rounded-md tracking-wider uppercase">
                                                    Almost Done
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <Link href={`/courses/${course.slug}/learn`}>
                                                <h3 className="font-extrabold text-[#00153e] text-base group-hover:text-[#006a6a] transition-colors leading-snug line-clamp-2">
                                                    {course.title}
                                                </h3>
                                            </Link>
                                            {course.progress < 100 && (
                                                <p className="text-xs text-gray-400 font-medium truncate">
                                                    Next: {course.nextLesson || "Continue where you left off"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Progress indicator */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                                <span>Progress</span>
                                                <span className="text-[#00153e]">{course.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden border border-gray-100">
                                                <div 
                                                    className="bg-[#006a6a] h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer info */}
                                    <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/10">
                                        {/* Avatars */}
                                        <div className="flex items-center -space-x-2">
                                            {groupAvatars.map((seed, seedIdx) => (
                                                <div key={seedIdx} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden relative shadow-sm">
                                                    <Image 
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                                                        alt={seed}
                                                        fill
                                                        className="rounded-full"
                                                    />
                                                </div>
                                            ))}
                                            <span className="text-[10px] text-gray-400 font-bold ml-3 uppercase">+{idx * 3 + 7} joined</span>
                                        </div>

                                        {/* Open Link */}
                                        <Link 
                                            href={`/courses/${course.slug}/learn`}
                                            className="text-xs font-extrabold text-[#00153e] hover:text-[#006a6a] transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Open Module</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
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

function StatCard({
    icon,
    label,
    value,
    iconBg
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    iconBg: string;
}) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-lg hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
                <p className="text-2xl font-extrabold text-[#00153e] tracking-tight mt-1 truncate">{value}</p>
            </div>
        </div>
    );
}
