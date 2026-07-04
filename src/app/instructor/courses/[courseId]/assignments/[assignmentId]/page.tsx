import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import GradingClient from "./GradingClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function GradingPage({
    params,
}: {
    params: Promise<{ courseId: string; assignmentId: string }>;
}) {
    const { courseId, assignmentId } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        return redirect("/auth/signin");
    }

    // Fetch Assignment with Submissions
    // Verify Instructor Ownership via Course relation
    const assignment = await prisma.assignment.findFirst({
        where: {
            id: assignmentId,
            lesson: {
                module: {
                    course: {
                        id: courseId,
                        instructorId: session.user.id,
                    },
                },
            },
        },
        include: {
            submissions: {
                include: {
                    user: {
                        select: { name: true, email: true, avatar: true },
                    },
                },
                orderBy: { submittedAt: "desc" },
            },
            lesson: {
                select: { title: true },
            },
        },
    });

    if (!assignment) {
        return redirect(`/instructor/courses/${courseId}/assignments`);
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <Link
                    href={`/instructor/courses/${courseId}/assignments`}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Assignments
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Grading: {assignment.title}</h1>
                <p className="text-gray-500 mt-2">
                    Lesson: {assignment.lesson.title} • {assignment.submissions.length} Submissions
                </p>
            </div>

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <GradingClient assignment={assignment as any} />
        </div>
    );
}
