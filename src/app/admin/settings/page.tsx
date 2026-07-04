"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Shield,
    Bell,
    CreditCard,
    User,
    Mail,
    Lock,
    Globe,
    Save,
    Loader2
} from "lucide-react";
import { getSettings, bulkUpdateSettings } from "@/actions/admin/settings";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        { id: "general", label: "General", icon: <Settings className="w-4 h-4" /> },
        { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
        { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
        { id: "billing", label: "Billing", icon: <CreditCard className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">


            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id
                                    ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        {activeTab === "general" && <GeneralSettings />}
                        {activeTab === "security" && <SecuritySettings />}
                        {activeTab === "notifications" && <NotificationSettings />}
                        {activeTab === "billing" && <BillingSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GeneralSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        platformName: "Clean Tech Hub",
        supportEmail: "support@cleantechhub.com",
        description: "Leading LMS for renewable energy and sustainable technology education."
    });

    useEffect(() => {
        getSettings().then(res => {
            if (res.success && res.data) {
                setSettings({
                    platformName: res.data.platform_name?.value || "Clean Tech Hub",
                    supportEmail: res.data.contact_email?.value || "support@cleantechhub.com",
                    description: res.data.platform_description?.value || "Leading LMS for renewable energy and sustainable technology education.",
                });
            }
            setLoading(false);
        });
    }, []);

    const handleChange = (field: keyof typeof settings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const promise = bulkUpdateSettings([
            { key: "platform_name", value: settings.platformName },
            { key: "contact_email", value: settings.supportEmail },
            { key: "platform_description", value: settings.description },
        ]);

        toast.promise(promise, {
            loading: "Saving changes...",
            success: "Settings updated successfully",
            error: "Failed to update settings"
        });

        await promise;
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Platform Details</h2>
                <p className="text-sm text-gray-500">Basic information about the LMS instance.</p>
            </div>

            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Platform Name</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={settings.platformName}
                                onChange={(e) => handleChange("platformName", e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Support Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => handleChange("supportEmail", e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Platform Description</label>
                    <textarea
                        rows={4}
                        value={settings.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all outline-none resize-none"
                    />
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-lg shadow-gray-900/10"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SecuritySettings() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Security Configuration</h2>
                <p className="text-sm text-gray-500">Manage access controls and authentication policies.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-600">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Two-Factor Authentication (2FA)</h4>
                                <p className="text-sm text-gray-500">Require 2FA for all admin accounts.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">New User Approval</h4>
                                <p className="text-sm text-gray-500">Manually approve new instructor signups.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NotificationSettings() {
    return (
        <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
            <p className="text-gray-500">Email and push notification settings coming soon.</p>
        </div>
    );
}

function BillingSettings() {
    return (
        <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Billing & Payouts</h3>
            <p className="text-gray-500">Payment gateway configuration coming soon.</p>
        </div>
    );
}
