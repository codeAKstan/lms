"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import { RefreshCw, Mail, Clock, CheckCircle, Trash2 } from "lucide-react";
import {
    getContactSubmissions,
    updateSubmissionStatus,
    deleteContactSubmission,
} from "@/actions/admin/contact";

interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function ContactSubmissionsPage() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string | null>(null);

    const loadSubmissions = async () => {
        setLoading(true);
        const result = await getContactSubmissions();
        if (result.success && result.data) {
            setSubmissions(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is a standard pattern
        loadSubmissions();
    }, []);

    const handleStatusChange = async (id: string, status: string) => {
        const result = await updateSubmissionStatus(id, status);
        if (result.success) {
            await loadSubmissions();
        } else {
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this submission?")) return;

        const result = await deleteContactSubmission(id);
        if (result.success) {
            await loadSubmissions();
        } else {
            alert("Failed to delete submission");
        }
    };

    const filteredSubmissions = filter
        ? submissions.filter((s) => s.status === filter)
        : submissions;

    const statuses = ["unread", "read", "replied"];
    const statusColors: Record<string, string> = {
        unread: "bg-yellow-100 text-yellow-800",
        read: "bg-blue-100 text-blue-800",
        replied: "bg-green-100 text-green-800",
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl">


            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <Button
                    variant={filter === null ? "primary" : "outline"}
                    onClick={() => setFilter(null)}
                    size="sm"
                >
                    All ({submissions.length})
                </Button>
                {statuses.map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? "primary" : "outline"}
                        onClick={() => setFilter(status)}
                        size="sm"
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)} (
                        {submissions.filter((s) => s.status === status).length})
                    </Button>
                ))}
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
                {filteredSubmissions.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-accent mb-2">No Submissions</h3>
                        <p className="text-muted-foreground">
                            {filter ? `No ${filter} submissions found.` : "No contact submissions yet."}
                        </p>
                    </Card>
                ) : (
                    filteredSubmissions.map((submission) => (
                        <Card key={submission.id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg text-accent">
                                            {submission.subject}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${statusColors[submission.status]
                                                }`}
                                        >
                                            {submission.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        From: <strong>{submission.name}</strong> ({submission.email})
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(submission.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {submission.status !== "replied" && (
                                        <Button
                                            onClick={() => handleStatusChange(submission.id, "replied")}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Mark Replied
                                        </Button>
                                    )}
                                    {submission.status === "unread" && (
                                        <Button
                                            onClick={() => handleStatusChange(submission.id, "read")}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Mark Read
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => handleDelete(submission.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.message}</p>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
