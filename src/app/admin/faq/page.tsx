"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/components/ui";
import {
    Plus,
    Save,
    Trash2,
    GripVertical,
    RefreshCw,
    Eye,
    EyeOff,
} from "lucide-react";
import {
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    initializeDefaultFAQs,
} from "@/actions/admin/faq";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string | null;
    position: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default function FAQManagementPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newFAQ, setNewFAQ] = useState({
        question: "",
        answer: "",
        category: "",
    });

    const loadFAQs = async () => {
        setLoading(true);
        const result = await getFAQs();
        if (result.success && result.data) {
            setFaqs(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is a standard pattern
        loadFAQs();
    }, []);

    const handleInitialize = async () => {
        if (!confirm("Initialize default FAQs? This will add 6 sample questions.")) {
            return;
        }

        setSaving(true);
        const result = await initializeDefaultFAQs();
        if (result.success) {
            alert("Default FAQs initialized successfully!");
            await loadFAQs();
        } else {
            alert("Failed to initialize FAQs");
        }
        setSaving(false);
    };

    const handleCreate = async () => {
        if (!newFAQ.question || !newFAQ.answer) {
            alert("Please enter both question and answer");
            return;
        }

        setSaving(true);
        const result = await createFAQ(newFAQ);
        if (result.success) {
            setNewFAQ({ question: "", answer: "", category: "" });
            await loadFAQs();
        } else {
            alert("Failed to create FAQ");
        }
        setSaving(false);
    };

    const handleUpdate = async (id: string, data: Partial<FAQ>) => {
        setSaving(true);
        const result = await updateFAQ(id, {
            ...data,
            category: data.category || undefined,
        });
        if (result.success) {
            await loadFAQs();
            setEditingId(null);
        } else {
            alert("Failed to update FAQ");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) {
            return;
        }

        setSaving(true);
        const result = await deleteFAQ(id);
        if (result.success) {
            await loadFAQs();
        } else {
            alert("Failed to delete FAQ");
        }
        setSaving(false);
    };

    const handleToggleActive = async (id: string, active: boolean) => {
        await handleUpdate(id, { active: !active });
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

    const hasFAQs = faqs.length > 0;

    return (
        <div className="p-8 max-w-5xl">


            {/* Initialize Button */}
            {!hasFAQs && (
                <Card className="p-8 mb-6 text-center">
                    <h2 className="text-xl font-bold text-accent mb-4">No FAQs Found</h2>
                    <p className="text-muted-foreground mb-6">
                        Initialize with default FAQs to get started
                    </p>
                    <Button
                        onClick={handleInitialize}
                        disabled={saving}
                        variant="primary"
                    >
                        {saving ? "Initializing..." : "Initialize Default FAQs"}
                    </Button>
                </Card>
            )}

            {/* Add New FAQ */}
            <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold text-accent mb-4">Add New FAQ</h2>
                <div className="space-y-4">
                    <Input
                        label="Question"
                        value={newFAQ.question}
                        onChange={(e) =>
                            setNewFAQ({ ...newFAQ, question: e.target.value })
                        }
                        placeholder="What courses do you offer?"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer
                        </label>
                        <textarea
                            value={newFAQ.answer}
                            onChange={(e) =>
                                setNewFAQ({ ...newFAQ, answer: e.target.value })
                            }
                            placeholder="We offer a comprehensive range of courses..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        />
                    </div>
                    <Input
                        label="Category (Optional)"
                        value={newFAQ.category}
                        onChange={(e) =>
                            setNewFAQ({ ...newFAQ, category: e.target.value })
                        }
                        placeholder="e.g., Courses, Payments, Technical"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleCreate}
                            disabled={saving || !newFAQ.question || !newFAQ.answer}
                            variant="primary"
                        >
                            <Plus className="w-4 h-4" />
                            Add FAQ
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Existing FAQs */}
            {hasFAQs && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-accent">
                            All FAQs ({faqs.length})
                        </h2>
                        {hasFAQs && (
                            <Button
                                onClick={loadFAQs}
                                variant="outline"
                                size="sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        )}
                    </div>

                    {faqs.map((faq, index) => (
                        <Card key={faq.id} className="p-6">
                            <div className="flex items-start gap-4">
                                {/* Drag Handle */}
                                <div className="mt-2 cursor-move">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    {editingId === faq.id ? (
                                        <div className="space-y-4">
                                            <Input
                                                label="Question"
                                                value={faq.question}
                                                onChange={(e) => {
                                                    const updated = [...faqs];
                                                    updated[index].question = e.target.value;
                                                    setFaqs(updated);
                                                }}
                                            />
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Answer
                                                </label>
                                                <textarea
                                                    value={faq.answer}
                                                    onChange={(e) => {
                                                        const updated = [...faqs];
                                                        updated[index].answer = e.target.value;
                                                        setFaqs(updated);
                                                    }}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                                />
                                            </div>
                                            <Input
                                                label="Category"
                                                value={faq.category || ""}
                                                onChange={(e) => {
                                                    const updated = [...faqs];
                                                    updated[index].category = e.target.value;
                                                    setFaqs(updated);
                                                }}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() =>
                                                        handleUpdate(faq.id, {
                                                            question: faq.question,
                                                            answer: faq.answer,
                                                            category: faq.category || undefined,
                                                        })
                                                    }
                                                    disabled={saving}
                                                    variant="primary"
                                                    size="sm"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        loadFAQs(); // Reset changes
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-accent">
                                                        {faq.question}
                                                    </h3>
                                                    {faq.category && (
                                                        <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-md mt-1">
                                                            {faq.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            handleToggleActive(faq.id, faq.active)
                                                        }
                                                        variant="ghost"
                                                        size="sm"
                                                        title={
                                                            faq.active
                                                                ? "Hide from public"
                                                                : "Show in public"
                                                        }
                                                    >
                                                        {faq.active ? (
                                                            <Eye className="w-4 h-4 text-success" />
                                                        ) : (
                                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setEditingId(faq.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(faq.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
