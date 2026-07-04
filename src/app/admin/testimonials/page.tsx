"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/components/ui";
import { Plus, Save, Trash2, Star, StarOff, Eye, EyeOff, RefreshCw } from "lucide-react";
import {
    getTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    initializeDefaultTestimonials,
} from "@/actions/admin/testimonials";

interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string | null;
    content: string;
    avatar: string | null;
    rating: number | null;
    featured: boolean;
    active: boolean;
    position: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export default function TestimonialsManagementPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTestimonial, setNewTestimonial] = useState({
        name: "",
        role: "",
        company: "",
        content: "",
        rating: 5,
    });

    const loadTestimonials = async () => {
        setLoading(true);
        const result = await getTestimonials();
        if (result.success && result.data) {
            setTestimonials(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is a standard pattern
        void loadTestimonials();
    }, []);

    const handleInitialize = async () => {
        if (!confirm("Initialize default testimonials? This will add 3 sample testimonials.")) {
            return;
        }

        setSaving(true);
        const result = await initializeDefaultTestimonials();
        if (result.success) {
            alert("Default testimonials initialized successfully!");
            await loadTestimonials();
        } else {
            alert("Failed to initialize testimonials");
        }
        setSaving(false);
    };

    const handleCreate = async () => {
        if (!newTestimonial.name || !newTestimonial.role || !newTestimonial.content) {
            alert("Please fill in name, role, and content");
            return;
        }

        setSaving(true);
        const result = await createTestimonial(newTestimonial);
        if (result.success) {
            setNewTestimonial({ name: "", role: "", company: "", content: "", rating: 5 });
            await loadTestimonials();
        } else {
            alert("Failed to create testimonial");
        }
        setSaving(false);
    };

    const handleUpdate = async (id: string, data: Partial<Testimonial>) => {
        setSaving(true);
        const result = await updateTestimonial(id, {
            ...data,
            company: data.company || undefined,
            avatar: data.avatar ?? undefined,
            rating: data.rating ?? undefined,
        });
        if (result.success) {
            await loadTestimonials();
            setEditingId(null);
        } else {
            alert("Failed to update testimonial");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) {
            return;
        }

        setSaving(true);
        const result = await deleteTestimonial(id);
        if (result.success) {
            await loadTestimonials();
        } else {
            alert("Failed to delete testimonial");
        }
        setSaving(false);
    };

    const handleToggleFeatured = async (id: string, featured: boolean) => {
        await handleUpdate(id, { featured: !featured });
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

    const hasTestimonials = testimonials.length > 0;

    return (
        <div className="p-8 max-w-6xl">


            {/* Initialize Button */}
            {!hasTestimonials && (
                <Card className="p-8 mb-6 text-center">
                    <h2 className="text-xl font-bold text-accent mb-4">No Testimonials Found</h2>
                    <p className="text-muted-foreground mb-6">
                        Initialize with default testimonials to get started
                    </p>
                    <Button
                        onClick={handleInitialize}
                        disabled={saving}
                        variant="primary"
                    >
                        {saving ? "Initializing..." : "Initialize Default Testimonials"}
                    </Button>
                </Card>
            )}

            {/* Add New Testimonial */}
            <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold text-accent mb-4">Add New Testimonial</h2>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Name"
                            value={newTestimonial.name}
                            onChange={(e) =>
                                setNewTestimonial({ ...newTestimonial, name: e.target.value })
                            }
                            placeholder="Dr. Sarah Johnson"
                        />
                        <Input
                            label="Role"
                            value={newTestimonial.role}
                            onChange={(e) =>
                                setNewTestimonial({ ...newTestimonial, role: e.target.value })
                            }
                            placeholder="Environmental Scientist"
                        />
                    </div>
                    <Input
                        label="Company (Optional)"
                        value={newTestimonial.company}
                        onChange={(e) =>
                            setNewTestimonial({ ...newTestimonial, company: e.target.value })
                        }
                        placeholder="GreenTech Solutions"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Testimonial Content
                        </label>
                        <textarea
                            value={newTestimonial.content}
                            onChange={(e) =>
                                setNewTestimonial({ ...newTestimonial, content: e.target.value })
                            }
                            placeholder="Share your experience with Clean Technology Hub..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        />
                    </div>
                    <Input
                        label="Rating (1-5)"
                        type="number"
                        min="1"
                        max="5"
                        value={newTestimonial.rating.toString()}
                        onChange={(e) =>
                            setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) || 5 })
                        }
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleCreate}
                            disabled={saving || !newTestimonial.name || !newTestimonial.role || !newTestimonial.content}
                            variant="primary"
                        >
                            <Plus className="w-4 h-4" />
                            Add Testimonial
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Existing Testimonials */}
            {hasTestimonials && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-accent">
                            All Testimonials ({testimonials.length})
                        </h2>
                        <Button
                            onClick={loadTestimonials}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>

                    {testimonials.map((testimonial, index) => (
                        <Card key={testimonial.id} className="p-6">
                            {editingId === testimonial.id ? (
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="Name"
                                            value={testimonial.name}
                                            onChange={(e) => {
                                                const updated = [...testimonials];
                                                updated[index].name = e.target.value;
                                                setTestimonials(updated);
                                            }}
                                        />
                                        <Input
                                            label="Role"
                                            value={testimonial.role}
                                            onChange={(e) => {
                                                const updated = [...testimonials];
                                                updated[index].role = e.target.value;
                                                setTestimonials(updated);
                                            }}
                                        />
                                    </div>
                                    <Input
                                        label="Company"
                                        value={testimonial.company || ""}
                                        onChange={(e) => {
                                            const updated = [...testimonials];
                                            updated[index].company = e.target.value;
                                            setTestimonials(updated);
                                        }}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content
                                        </label>
                                        <textarea
                                            value={testimonial.content}
                                            onChange={(e) => {
                                                const updated = [...testimonials];
                                                updated[index].content = e.target.value;
                                                setTestimonials(updated);
                                            }}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                        />
                                    </div>
                                    <Input
                                        label="Rating"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={(testimonial.rating ?? 5).toString()}
                                        onChange={(e) => {
                                            const updated = [...testimonials];
                                            updated[index].rating = parseInt(e.target.value) || 5;
                                            setTestimonials(updated);
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() =>
                                                handleUpdate(testimonial.id, {
                                                    name: testimonial.name,
                                                    role: testimonial.role,
                                                    company: testimonial.company,
                                                    content: testimonial.content,
                                                    rating: testimonial.rating,
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
                                                loadTestimonials();
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
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-accent">{testimonial.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {testimonial.role}
                                                {testimonial.company && ` at ${testimonial.company}`}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < (testimonial.rating ?? 5)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
                                                variant="ghost"
                                                size="sm"
                                                title={testimonial.featured ? "Unfeature" : "Feature"}
                                            >
                                                {testimonial.featured ? (
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                ) : (
                                                    <StarOff className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => handleToggleActive(testimonial.id, testimonial.active)}
                                                variant="ghost"
                                                size="sm"
                                                title={testimonial.active ? "Deactivate" : "Activate"}
                                            >
                                                {testimonial.active ? (
                                                    <Eye className="w-4 h-4 text-success" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => setEditingId(testimonial.id)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(testimonial.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
