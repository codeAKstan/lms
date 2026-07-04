import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import AssignmentManagerClient from "./AssignmentManagerClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AssignmentManagerPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        return redirect("/auth/signin");
    }

    // Fetch course with curriculum and assignments
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
            instructorId: session.user.id, // Ensure ownership
        },
        include: {
            modules: {
                orderBy: { position: "asc" },
                include: {
                    lessons: {
                        orderBy: { position: "asc" },
                        include: {
                            assignment: true, // Fetch assignment
                        },
                    },
                },
            },
        },
    });

    if (!course) {
        return redirect("/instructor/courses");
    }

    // Transform to match component expectations (assignment -> assignments[])
    const transformedCourse = {
        ...course,
        modules: course.modules.map(mod => ({
            ...mod,
            lessons: mod.lessons.map(lesson => ({
                ...lesson,
                assignments: lesson.assignment ? [lesson.assignment] : []
            }))
        }))
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/instructor/courses"
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-500 mt-2">Manage Assignments & Homework</p>
            </div>

            <AssignmentManagerClient course={transformedCourse} />
        </div>
    );
}
