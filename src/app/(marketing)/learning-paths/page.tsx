import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Map as MapIcon, ChevronRight, BookOpen } from "lucide-react";

export const revalidate = 3600; // Cache for 1 hour

export default async function LearningPathsPage() {
    const paths = await prisma.learningPath.findMany({
        where: { published: true },
        include: {
            courses: {
                include: {
                    course: {
                        select: { id: true, title: true, price: true, thumbnail: true, level: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Learning Paths
                    </h1>
                    <p className="text-lg text-gray-600">
                        Follow curated tracks tailored to guide you from beginner to expert in specialized fields.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {paths.map(path => (
                        <Link key={path.id} href={`/learning-paths/${path.slug}`}>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full hover:shadow-md hover:border-primary/20 transition-all group flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <MapIcon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                        {path.title}
                                    </h2>
                                </div>
                                <p className="text-gray-600 mb-6 flex-1">
                                    {path.description || "A comprehensive learning track to master specific skills."}
                                </p>
                                
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{path.courses.filter(pc => pc.course).length} Courses included</span>
                                    </div>
                                    <span className="text-primary font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        View Track <ChevronRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {paths.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <MapIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No active tracks yet</h3>
                        <p className="text-gray-500">Check back later for newly published learning paths.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
