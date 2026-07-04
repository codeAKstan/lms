"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/components/ui";
import { Save, Plus, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
import {
    getHero,
    updateHero,
    initializeDefaultHero,
    getFocusAreas,
    createFocusArea,
    updateFocusArea,
    deleteFocusArea,
    initializeDefaultFocusAreas,
    getPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    initializeDefaultPrograms,
} from "@/actions/admin/homepage";

interface Hero {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
    backgroundImage: string | null;
}

interface FocusArea {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    position: number;
    active: boolean;
}

interface Program {
    id: string;
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
    position: number;
    active: boolean;
}

export default function HomepageContentPage() {
    const [hero, setHero] = useState<Hero | null>(null);
    const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"hero" | "focus" | "programs">("hero");

    const loadContent = async () => {
        setLoading(true);
        const [heroResult, focusResult, programsResult] = await Promise.all([
            getHero(),
            getFocusAreas(),
            getPrograms(),
        ]);

        if (heroResult.success && heroResult.data) {
            setHero(heroResult.data);
        }
        if (focusResult.success && focusResult.data) {
            setFocusAreas(focusResult.data);
        }
        if (programsResult.success && programsResult.data) {
            setPrograms(programsResult.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is a standard pattern
        void loadContent();
    }, []);

    const handleInitializeAll = async () => {
        if (!confirm("Initialize all homepage content with defaults?")) return;

        setSaving(true);
        await Promise.all([
            initializeDefaultHero(),
            initializeDefaultFocusAreas(),
            initializeDefaultPrograms(),
        ]);
        await loadContent();
        setSaving(false);
        alert("Homepage content initialized!");
    };

    const handleSaveHero = async () => {
        if (!hero) return;

        setSaving(true);
        const result = await updateHero({
            ...hero,
            backgroundImage: hero.backgroundImage || undefined,
        });
        if (result.success) {
            alert("Hero section saved!");
        } else {
            alert("Failed to save hero section");
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

    const hasContent = hero || focusAreas.length > 0 || programs.length > 0;

    return (
        <div className="p-8 max-w-6xl">


            {/* Initialize Button */}
            {!hasContent && (
                <Card className="p-8 mb-6 text-center">
                    <h2 className="text-xl font-bold text-accent mb-4">No Content Found</h2>
                    <p className="text-muted-foreground mb-6">
                        Initialize homepage content with default values
                    </p>
                    <Button
                        onClick={handleInitializeAll}
                        disabled={saving}
                        variant="primary"
                    >
                        {saving ? "Initializing..." : "Initialize Homepage Content"}
                    </Button>
                </Card>
            )}

            {/* Tabs */}
            {hasContent && (
                <>
                    <div className="flex gap-2 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("hero")}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === "hero"
                                ? "border-b-2 border-primary text-primary"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Hero Section
                        </button>
                        <button
                            onClick={() => setActiveTab("focus")}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === "focus"
                                ? "border-b-2 border-primary text-primary"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Focus Areas ({focusAreas.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("programs")}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === "programs"
                                ? "border-b-2 border-primary text-primary"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Programs ({programs.length})
                        </button>
                    </div>

                    {/* Hero Section Tab */}
                    {activeTab === "hero" && (
                        <HeroSection
                            hero={hero}
                            setHero={setHero}
                            onSave={handleSaveHero}
                            saving={saving}
                        />
                    )}

                    {/* Focus Areas Tab */}
                    {activeTab === "focus" && (
                        <FocusAreasSection
                            areas={focusAreas}
                            onReload={loadContent}
                        />
                    )}

                    {/* Programs Tab */}
                    {activeTab === "programs" && (
                        <ProgramsSection
                            programs={programs}
                            onReload={loadContent}
                        />
                    )}
                </>
            )}
        </div>
    );
}

function HeroSection({
    hero,
    setHero,
    onSave,
    saving,
}: {
    hero: Hero | null;
    setHero: (hero: Hero) => void;
    onSave: () => void;
    saving: boolean;
}) {
    if (!hero) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hero section found</p>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold text-accent mb-6">Hero Section</h2>
            <div className="space-y-4">
                <Input
                    label="Main Title"
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="Empowering the Future with"
                />
                <Input
                    label="Subtitle"
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    placeholder="Tech & Climate Education"
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={hero.description}
                        onChange={(e) =>
                            setHero({ ...hero, description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Primary Button Text"
                        value={hero.primaryBtnText}
                        onChange={(e) =>
                            setHero({ ...hero, primaryBtnText: e.target.value })
                        }
                        placeholder="Explore Courses"
                    />
                    <Input
                        label="Primary Button Link"
                        value={hero.primaryBtnLink}
                        onChange={(e) =>
                            setHero({ ...hero, primaryBtnLink: e.target.value })
                        }
                        placeholder="/dashboard"
                    />
                    <Input
                        label="Secondary Button Text"
                        value={hero.secondaryBtnText}
                        onChange={(e) =>
                            setHero({ ...hero, secondaryBtnText: e.target.value })
                        }
                        placeholder="Learn More"
                    />
                    <Input
                        label="Secondary Button Link"
                        value={hero.secondaryBtnLink}
                        onChange={(e) =>
                            setHero({ ...hero, secondaryBtnLink: e.target.value })
                        }
                        placeholder="/#programs"
                    />
                </div>
                <Input
                    label="Background Image URL (Optional)"
                    value={hero.backgroundImage || ""}
                    onChange={(e) =>
                        setHero({ ...hero, backgroundImage: e.target.value })
                    }
                    placeholder="/hero_cleantech_background.png"
                />
                <div className="flex justify-end pt-4">
                    <Button onClick={onSave} disabled={saving} variant="primary">
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Hero Section"}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

function FocusAreasSection({
    areas,
    onReload,
}: {
    areas: FocusArea[];
    onReload: () => void;
}) {
    const [newArea, setNewArea] = useState({
        title: "",
        description: "",
        icon: "Code",
        color: "primary",
    });
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!newArea.title || !newArea.description) {
            alert("Please fill in title and description");
            return;
        }

        setSaving(true);
        const result = await createFocusArea(newArea);
        if (result.success) {
            setNewArea({ title: "", description: "", icon: "Code", color: "primary" });
            await onReload();
        } else {
            alert("Failed to create focus area");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this focus area?")) return;

        setSaving(true);
        await deleteFocusArea(id);
        await onReload();
        setSaving(false);
    };

    const handleToggleActive = async (id: string, active: boolean) => {
        setSaving(true);
        await updateFocusArea(id, { active: !active });
        await onReload();
        setSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Add New */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-accent mb-4">Add Focus Area</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Title"
                        value={newArea.title}
                        onChange={(e) =>
                            setNewArea({ ...newArea, title: e.target.value })
                        }
                        placeholder="Tech Education"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon (Lucide name)
                        </label>
                        <input
                            value={newArea.icon}
                            onChange={(e) =>
                                setNewArea({ ...newArea, icon: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Code, Leaf, Zap"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={newArea.description}
                            onChange={(e) =>
                                setNewArea({ ...newArea, description: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleCreate} disabled={saving} variant="primary">
                        <Plus className="w-4 h-4" />
                        Add Focus Area
                    </Button>
                </div>
            </Card>

            {/* Existing Areas */}
            <div className="grid gap-4">
                {areas.map((area) => (
                    <Card key={area.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-accent">{area.title}</h3>
                                <p className="text-muted-foreground mt-2">{area.description}</p>
                                <div className="flex gap-2 mt-3 text-sm">
                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                        Icon: {area.icon}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                        Color: {area.color}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleToggleActive(area.id, area.active)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    {area.active ? (
                                        <Eye className="w-4 h-4 text-success" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleDelete(area.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function ProgramsSection({
    programs,
    onReload,
}: {
    programs: Program[];
    onReload: () => void;
}) {
    const [newProgram, setNewProgram] = useState({
        title: "",
        description: "",
        badge: "",
        badgeColor: "bg-primary",
    });
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!newProgram.title || !newProgram.description || !newProgram.badge) {
            alert("Please fill in all fields");
            return;
        }

        setSaving(true);
        const result = await createProgram(newProgram);
        if (result.success) {
            setNewProgram({ title: "", description: "", badge: "", badgeColor: "bg-primary" });
            await onReload();
        } else {
            alert("Failed to create program");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this program?")) return;

        setSaving(true);
        await deleteProgram(id);
        await onReload();
        setSaving(false);
    };

    const handleToggleActive = async (id: string, active: boolean) => {
        setSaving(true);
        await updateProgram(id, { active: !active });
        await onReload();
        setSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Add New */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-accent mb-4">Add Program</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Title"
                        value={newProgram.title}
                        onChange={(e) =>
                            setNewProgram({ ...newProgram, title: e.target.value })
                        }
                        placeholder="Professional Courses"
                    />
                    <Input
                        label="Badge Text"
                        value={newProgram.badge}
                        onChange={(e) =>
                            setNewProgram({ ...newProgram, badge: e.target.value })
                        }
                        placeholder="Career Ready"
                    />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={newProgram.description}
                            onChange={(e) =>
                                setNewProgram({ ...newProgram, description: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleCreate} disabled={saving} variant="primary">
                        <Plus className="w-4 h-4" />
                        Add Program
                    </Button>
                </div>
            </Card>

            {/* Existing Programs */}
            <div className="grid gap-4">
                {programs.map((program) => (
                    <Card key={program.id} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-accent">
                                        {program.title}
                                    </h3>
                                    <span className={`px-3 py-1 text-xs text-white rounded-lg ${program.badgeColor}`}>
                                        {program.badge}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">{program.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleToggleActive(program.id, program.active)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    {program.active ? (
                                        <Eye className="w-4 h-4 text-success" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleDelete(program.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
