"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/components/ui";
import { Save, RefreshCw } from "lucide-react";
import { getSettings, bulkUpdateSettings, initializeDefaultSettings } from "@/actions/admin/settings";

interface Setting {
    value: string;
    type: string;
    description?: string;
}

export default function SiteContentPage() {
    const [settings, setSettings] = useState<Record<string, Setting>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initializing, setInitializing] = useState(false);

    const loadSettings = async () => {
        setLoading(true);
        const result = await getSettings();
        if (result.success && result.data) {
            setSettings(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is a standard pattern
        void loadSettings();
    }, []);

    const handleInitialize = async () => {
        if (!confirm("Initialize default settings? This will set default values for all site settings.")) {
            return;
        }

        setInitializing(true);
        const result = await initializeDefaultSettings();
        if (result.success) {
            alert("Default settings initialized successfully!");
            await loadSettings();
        } else {
            alert("Failed to initialize settings");
        }
        setInitializing(false);
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], value },
        }));
    };

    const handleSave = async () => {
        setSaving(true);

        const settingsArray = Object.entries(settings).map(([key, setting]) => ({
            key,
            value: setting.value,
            description: setting.description,
        }));

        const result = await bulkUpdateSettings(settingsArray);

        if (result.success) {
            alert("Settings saved successfully!");
        } else {
            alert("Failed to save settings");
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

    const hasSettings = Object.keys(settings).length > 0;

    return (
        <div className="p-8">


            {/* Initialize Button */}
            {!hasSettings && (
                <Card className="p-8 mb-6 text-center">
                    <h2 className="text-xl font-bold text-accent mb-4">No Settings Found</h2>
                    <p className="text-muted-foreground mb-6">
                        Initialize default settings to get started with site configuration
                    </p>
                    <Button
                        onClick={handleInitialize}
                        disabled={initializing}
                        variant="primary"
                    >
                        {initializing ? "Initializing..." : "Initialize Default Settings"}
                    </Button>
                </Card>
            )}

            {/* Settings Form */}
            {hasSettings && (
                <>
                    <div className="grid gap-6">
                        {/* Contact Information Section */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-accent mb-6">Contact Information</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <SettingField
                                    label="Email Address"
                                    value={settings["contact_email"]?.value || ""}
                                    onChange={(value) => handleChange("contact_email", value)}
                                    placeholder="info@cleantechnologyhub.org"
                                />
                                <SettingField
                                    label="Phone Number"
                                    value={settings["contact_phone"]?.value || ""}
                                    onChange={(value) => handleChange("contact_phone", value)}
                                    placeholder="+234 809 602 4444"
                                />
                                <div className="md:col-span-2">
                                    <SettingField
                                        label="Physical Address"
                                        value={settings["contact_address"]?.value || ""}
                                        onChange={(value) => handleChange("contact_address", value)}
                                        placeholder="1, Sarki Tafida St. Guzape, Abuja FCT, Nigeria"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <SettingField
                                        label="Office Hours"
                                        value={settings["office_hours"]?.value || ""}
                                        onChange={(value) => handleChange("office_hours", value)}
                                        placeholder="Mon - Fri: 9AM - 5PM WAT"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Google Maps Section */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-accent mb-6">Google Maps</h2>
                            <SettingField
                                label="Embed URL"
                                value={settings["google_maps_embed"]?.value || ""}
                                onChange={(value) => handleChange("google_maps_embed", value)}
                                placeholder="https://www.google.com/maps/embed?pb=..."
                                description="Get this from Google Maps → Share → Embed a map → Copy HTML (src attribute)"
                            />
                        </Card>

                        {/* Social Media Section */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-accent mb-6">Social Media Links</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <SettingField
                                    label="Facebook"
                                    value={settings["facebook_url"]?.value || ""}
                                    onChange={(value) => handleChange("facebook_url", value)}
                                    placeholder="https://facebook.com/cleantechnologyhub"
                                />
                                <SettingField
                                    label="Twitter/X"
                                    value={settings["twitter_url"]?.value || ""}
                                    onChange={(value) => handleChange("twitter_url", value)}
                                    placeholder="https://twitter.com/cleantechhub"
                                />
                                <SettingField
                                    label="LinkedIn"
                                    value={settings["linkedin_url"]?.value || ""}
                                    onChange={(value) => handleChange("linkedin_url", value)}
                                    placeholder="https://linkedin.com/company/cleantechnologyhub"
                                />
                                <SettingField
                                    label="Instagram"
                                    value={settings["instagram_url"]?.value || ""}
                                    onChange={(value) => handleChange("instagram_url", value)}
                                    placeholder="https://instagram.com/cleantechhub"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4 mt-8">
                        <Button
                            variant="outline"
                            onClick={loadSettings}
                            disabled={saving}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reset
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={saving}
                            size="lg"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

function SettingField({
    label,
    value,
    onChange,
    placeholder,
    description,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
}) {
    return (
        <div>
            <Input
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
        </div>
    );
}
