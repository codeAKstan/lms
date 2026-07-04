import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Map as MapIcon, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui";

export default async function LearningPathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const path = await prisma.learningPath.findUnique({
        where: { slug },
        include: {
            courses: {
                include: {
                    course: {
                        include: {
                            instructor: { select: { name: true, avatar: true } }
                        }
                    }
                },
                orderBy: { position: "asc" }
            }
        }
    });

    if (!path || !path.published) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-20 lg:py-28 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-light border border-primary/30 text-sm font-medium mb-6">
                            <MapIcon className="w-4 h-4" />
                            Learning Path
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
                            {path.title}
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                            {path.description || "Follow this curated sequence of courses to achieve mastery in this field."}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
                            <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                                <BookOpen className="w-4 h-4 text-gray-300" />
                                {path.courses.length} Courses
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Curriculum Section */}
            <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Journey</h2>
                        <p className="text-gray-600">Complete the courses below to finish this learning track</p>
                    </div>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                        {path.courses.map((pc, index) => {
                            const course = pc.course;
                            return (
                            <div key={course.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Timeline Dot */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    {index + 1}
                                </div>
                                
                                {/* Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all">
                                    <div className="flex items-center justify-between mb-3 text-sm">
                                        <span className={`px-2.5 py-1 rounded-md font-medium ${course.level === 'Beginner' ? 'bg-green-100 text-green-700' : course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                            {course.level}
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                        <Link href={`/courses/${course.slug}`} className="hover:text-primary transition-colors">
                                            {course.title}
                                        </Link>
                                    </h3>
                                    
                                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                                        {course.instructor?.avatar ? (
                                            <Image src={course.instructor.avatar} alt={course.instructor.name || "Instructor"} width={24} height={24} className="rounded-full object-cover w-6 h-6 border border-gray-100" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold flex items-center justify-center text-gray-500 border border-gray-200">
                                                {course.instructor?.name?.charAt(0) || "I"}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-600">{course.instructor?.name || "Instructor"}</span>
                                    </div>

                                    <div className="mt-5">
                                        <Link href={`/courses/${course.slug}`}>
                                            <Button variant="outline" size="sm" className="w-full justify-between group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                                View Course <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>

                    {path.courses.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                            <p className="text-gray-500">Courses are currently being added to this learning path.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
