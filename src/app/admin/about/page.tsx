"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/components/ui";
import { Plus, Save, Trash2, RefreshCw, Eye, EyeOff } from "lucide-react";
import {
    getImpactMetrics,
    createImpactMetric,
    updateImpactMetric,
    deleteImpactMetric,
    initializeDefaultMetrics,
} from "@/actions/admin/impact";

interface ImpactMetric {
    id: string;
    label: string;
    value: string;
    position: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default function ImpactMetricsPage() {
    const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newMetric, setNewMetric] = useState({ label: "", value: "" });

    const loadMetrics = async () => {
        setLoading(true);
        const result = await getImpactMetrics();
        if (result.success && result.data) {
            setMetrics(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is a standard pattern
        loadMetrics();
    }, []);

    const handleInitialize = async () => {
        if (!confirm("Initialize default metrics? This will add 4 sample metrics.")) return;

        setSaving(true);
        const result = await initializeDefaultMetrics();
        if (result.success) {
            alert("Default metrics initialized!");
            await loadMetrics();
        } else {
            alert("Failed to initialize metrics");
        }
        setSaving(false);
    };

    const handleCreate = async () => {
        if (!newMetric.label || !newMetric.value) {
            alert("Please fill in both label and value");
            return;
        }

        setSaving(true);
        const result = await createImpactMetric(newMetric);
        if (result.success) {
            setNewMetric({ label: "", value: "" });
            await loadMetrics();
        } else {
            alert("Failed to create metric");
        }
        setSaving(false);
    };

    const handleUpdate = async (id: string, data: Partial<ImpactMetric>) => {
        setSaving(true);
        const result = await updateImpactMetric(id, data);
        if (result.success) {
            await loadMetrics();
            setEditingId(null);
        } else {
            alert("Failed to update metric");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this metric?")) return;

        setSaving(true);
        const result = await deleteImpactMetric(id);
        if (result.success) {
            await loadMetrics();
        } else {
            alert("Failed to delete metric");
        }
        setSaving(false);
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

    const hasMetrics = metrics.length > 0;

    return (
        <div className="p-8 max-w-4xl">


            {!hasMetrics && (
                <Card className="p-8 mb-6 text-center">
                    <h2 className="text-xl font-bold text-accent mb-4">No Metrics Found</h2>
                    <p className="text-muted-foreground mb-6">
                        Initialize with default metrics to get started
                    </p>
                    <Button onClick={handleInitialize} disabled={saving} variant="primary">
                        {saving ? "Initializing..." : "Initialize Default Metrics"}
                    </Button>
                </Card>
            )}

            <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold text-accent mb-4">Add New Metric</h2>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Label"
                            value={newMetric.label}
                            onChange={(e) => setNewMetric({ ...newMetric, label: e.target.value })}
                            placeholder="Students Trained"
                        />
                        <Input
                            label="Value"
                            value={newMetric.value}
                            onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                            placeholder="5000+"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleCreate}
                            disabled={saving || !newMetric.label || !newMetric.value}
                            variant="primary"
                        >
                            <Plus className="w-4 h-4" />
                            Add Metric
                        </Button>
                    </div>
                </div>
            </Card>

            {hasMetrics && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-accent">All Metrics ({metrics.length})</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {metrics.map((metric, index) => (
                            <Card key={metric.id} className="p-6">
                                {editingId === metric.id ? (
                                    <div className="space-y-4">
                                        <Input
                                            label="Label"
                                            value={metric.label}
                                            onChange={(e) => {
                                                const updated = [...metrics];
                                                updated[index].label = e.target.value;
                                                setMetrics(updated);
                                            }}
                                        />
                                        <Input
                                            label="Value"
                                            value={metric.value}
                                            onChange={(e) => {
                                                const updated = [...metrics];
                                                updated[index].value = e.target.value;
                                                setMetrics(updated);
                                            }}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() =>
                                                    handleUpdate(metric.id, {
                                                        label: metric.label,
                                                        value: metric.value,
                                                    })
                                                }
                                                disabled={saving}
                                                variant="primary"
                                                size="sm"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    loadMetrics();
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
                                                <div className="text-3xl font-bold text-primary mb-1">
                                                    {metric.value}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{metric.label}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleUpdate(metric.id, { active: !metric.active })}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    {metric.active ? (
                                                        <Eye className="w-4 h-4 text-success" />
                                                    ) : (
                                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => setEditingId(metric.id)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(metric.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
