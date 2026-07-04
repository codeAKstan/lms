import { createLearningPath } from "@/actions/admin/learning-paths";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewLearningPathPage() {
    async function handleSubmit(formData: FormData) {
        "use server";
        
        const title = formData.get("title") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const isPublished = formData.get("isPublished") === "true";

        if (!title || !slug) return;

        const path = await createLearningPath({
            title,
            slug,
            description,
            isPublished
        });

        redirect(`/admin/learning-paths/${path.id}`);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/learning-paths"
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded hover:bg-gray-100"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Learning Path</h1>
                    <p className="text-gray-500 mt-1">Setup the basics for your new track</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form action={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                            placeholder="e.g. Fullstack Web Development Track"
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
                            required
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-mono"
                            placeholder="e.g. fullstack-web-dev"
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be unique and contain no spaces.</p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm resize-y"
                            placeholder="Provide an overview of this learning path..."
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            name="isPublished"
                            id="isPublished"
                            value="true"
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                            Publish immediately
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary text-white rounded font-medium hover:bg-primary/90 shadow-sm transition-colors"
                        >
                            Create Learning Path
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
