import {
    getLearningPathById,
    updateLearningPath,
    getAvailableCoursesForPath,
    addCourseToPath,
    removeCourseFromPath
} from "@/actions/admin/learning-paths";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import LearningPathCourseManager from "@/components/admin/LearningPathCourseManager";

export default async function EditLearningPathPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const path = await getLearningPathById(id);

    if (!path) {
        notFound();
    }

    const availableCourses = await getAvailableCoursesForPath(id);

    async function handleUpdate(formData: FormData) {
        "use server";
        
        const title = formData.get("title") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const isPublished = formData.get("isPublished") === "true";

        if (!title || !slug) return;

        await updateLearningPath(id, {
            title,
            slug,
            description,
            isPublished
        });
    }

    // Helper functions to bridge Client Component interactions with Server Actions
    async function bindAddCourse(pathId: string, courseId: string) {
        "use server";
        await addCourseToPath(pathId, courseId);
    }

    async function bindRemoveCourse(pathId: string, courseId: string) {
        "use server";
        await removeCourseFromPath(pathId, courseId);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/learning-paths"
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded hover:bg-gray-100"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Learning Path</h1>
                    <p className="text-gray-500 mt-1">Manage details and courses for {path.title}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Details Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">Basic Details</h2>
                    <form action={handleUpdate} className="space-y-5">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                defaultValue={path.title}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                                URL Slug
                            </label>
                            <input
                                type="text"
                                name="slug"
                                id="slug"
                                defaultValue={path.slug}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-mono text-gray-600"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                rows={5}
                                defaultValue={path.description || ""}
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm resize-y"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                name="isPublished"
                                id="isPublished"
                                value="true"
                                defaultChecked={path.published}
                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                                Published
                            </label>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-white rounded font-medium hover:bg-primary/90 shadow-sm transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Course Manager */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">Course Curriculum</h2>
                    <LearningPathCourseManager 
                        pathId={path.id}
                        availableCourses={availableCourses}
                        existingCourses={path.courses}
                        onAddCourse={bindAddCourse}
                        onRemoveCourse={bindRemoveCourse}
                    />
                </div>
            </div>
        </div>
    );
}
