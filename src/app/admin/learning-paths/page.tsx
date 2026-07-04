import Link from "next/link";
import { Plus, Settings, Eye, Trash2 } from "lucide-react";
import { getLearningPaths, deleteLearningPath } from "@/actions/admin/learning-paths";

export const dynamic = 'force-dynamic';

export default async function AdminLearningPathsPage() {
    const paths = await getLearningPaths();

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-end gap-4">
                <Link
                    href="/admin/learning-paths/new"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Create Path
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-semibold text-gray-500 tracking-wider">
                                <th className="p-4 rounded-tl-xl whitespace-nowrap">Title</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4 text-center">Courses</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 rounded-tr-xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paths.map((path: { id: string; title: string; slug: string; published: boolean; _count: { courses: number } }) => (
                                <tr key={path.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">
                                        <Link href={`/admin/learning-paths/${path.id}`} className="hover:text-primary transition-colors">
                                            {path.title}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">/{path.slug}</td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                                            {path._count.courses}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${path.published ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${path.published ? 'bg-success' : 'bg-gray-400'}`}></span>
                                            {path.published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={`/learning-paths/${path.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded"
                                                title="View Public Page"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <Link
                                                href={`/admin/learning-paths/${path.id}`}
                                                className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors hover:bg-blue-50 rounded"
                                                title="Edit"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Link>
                                            <form action={async () => {
                                                "use server";
                                                await deleteLearningPath(path.id);
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded"
                                                    title="Delete"
                                                    onClick={(e) => {
                                                        if (!confirm("Are you sure you want to delete this learning path?")) e.preventDefault();
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paths.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No learning paths found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
