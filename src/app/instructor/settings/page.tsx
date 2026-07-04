"use client";

import { User, Bell, Lock, Save, Camera, Loader2, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getInstructorProfile, updateInstructorProfile, getNotificationPrefs, updateNotificationPrefs } from "@/actions/instructor/settings";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { uploadFile, getAllowedTypes, getMaxSize } from "@/lib/upload";

export default function InstructorSettingsPage() {
    const [name, setName] = useState("");
    const [honorific, setHonorific] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState("");
    const [title, setTitle] = useState("");
    const [expertise, setExpertise] = useState("");

    // Payout settings state
    const [payoutMethod, setPayoutMethod] = useState("");
    const [payoutAccountName, setPayoutAccountName] = useState("");
    const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
    const [payoutBankName, setPayoutBankName] = useState("");

    // Notification prefs state
    const [notifEnrollment, setNotifEnrollment] = useState(true);
    const [notifCompletion, setNotifCompletion] = useState(true);
    const [notifMarketing, setNotifMarketing] = useState(false);
    const [isSavingNotifs, setIsSavingNotifs] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { user } = useAuth();
    
    // Security prefs state
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [isResetSent, setIsResetSent] = useState(false);
    const [hasRecoveryEvent, setHasRecoveryEvent] = useState(false);
    const [passwords, setPasswords] = useState({ newPass: "", confirmPass: "" });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setHasRecoveryEvent(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSendResetLink = async () => {
        if (!user?.email) return;
        setIsSendingReset(true);
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/instructor/settings`
        });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Confirmation link sent to your email.");
            setIsResetSent(true);
        }
        setIsSendingReset(false);
    };

    const handleUpdatePassword = async () => {
        if (passwords.newPass !== passwords.confirmPass) {
            toast.error("Passwords do not match.");
            return;
        }
        if (passwords.newPass.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setIsUpdatingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password secured and updated");
            setPasswords({ newPass: "", confirmPass: "" });
            setHasRecoveryEvent(false);
        }
        setIsUpdatingPassword(false);
    };

    useEffect(() => {
        async function fetchProfile() {
            const profile = await getInstructorProfile();
            if (profile) {
                setName(profile.name || "");
                setHonorific(profile.honorific || "");
                setBio(profile.bio || "");
                setAvatar(profile.avatar || "");
                setTitle(profile.title || "");
                setExpertise(profile.expertise || "");
                setPayoutMethod(profile.payoutMethod || "");
                setPayoutAccountName(profile.payoutAccountName || "");
                setPayoutAccountNumber(profile.payoutAccountNumber || "");
                setPayoutBankName(profile.payoutBankName || "");
            }

            try {
                const prefs = await getNotificationPrefs();
                if (prefs) {
                    setNotifEnrollment(prefs.enrollment);
                    setNotifCompletion(prefs.completion);
                    setNotifMarketing(prefs.marketing);
                }
            } catch {
                // Silently fail if schema not yet pushed
            }

            setIsLoading(false);
        }
        fetchProfile();
    }, []);

    const handleSaveNotifications = async () => {
        setIsSavingNotifs(true);
        try {
            await updateNotificationPrefs({
                enrollment: notifEnrollment,
                completion: notifCompletion,
                marketing: notifMarketing
            });
            toast.success("Notification preferences saved!");
        } catch {
            toast.error("Failed to save notification preferences.");
        } finally {
            setIsSavingNotifs(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateInstructorProfile({ 
                name, bio, avatar, honorific, title, expertise, payoutMethod, payoutAccountName, payoutAccountNumber, payoutBankName
            });
            toast.success("Profile updated successfully!");
            // Notify sidebar (and any other listeners) that profile has changed
            window.dispatchEvent(new CustomEvent("instructor-profile-updated", {
                detail: { name, avatar, honorific, title, expertise }
            }));
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            toast.loading("Uploading avatar...", { id: "avatar-upload" });
            const result = await uploadFile(file, {
                bucket: "avatars",
                folder: user?.id,
                allowedTypes: getAllowedTypes('image'),
                maxSize: getMaxSize('image')
            });
            setAvatar(result.url);
            toast.success("Avatar uploaded! Remember to save.", { id: "avatar-upload" });
        } catch (err) {
            console.error("Upload error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to upload avatar", { id: "avatar-upload" });
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">


            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Public Profile</h2>

                    <div className="flex items-start gap-8">
                        <div className="flex-shrink-0 text-center">
                            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center relative mb-4 overflow-hidden">
                                {avatar ? (
                                    <Image src={avatar} alt="Profile avatar" fill className="object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    {isUploading ? (
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Allowed *.jpeg, *.jpg, *.png</span>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Display Name</label>
                                <div className="flex gap-4">
                                    <select
                                        value={honorific}
                                        onChange={e => setHonorific(e.target.value)}
                                        className="w-32 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                    >
                                        <option value="">None</option>
                                        <option value="Mr.">Mr.</option>
                                        <option value="Mrs.">Mrs.</option>
                                        <option value="Ms.">Ms.</option>
                                        <option value="Dr.">Dr.</option>
                                        <option value="Prof.">Prof.</option>
                                        <option value="Engr.">Engr.</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Professional Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Senior Solar Engineer"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Area of Expertise</label>
                                    <input
                                        type="text"
                                        value={expertise}
                                        onChange={e => setExpertise(e.target.value)}
                                        placeholder="e.g. Renewable Energy"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Bio</label>
                                <textarea
                                    rows={4}
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    placeholder="Tell students about your expertise..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Payout Settings</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Payout Method</label>
                            <select
                                value={payoutMethod}
                                onChange={e => setPayoutMethod(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            >
                                <option value="">Select a method</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Bank Name</label>
                            <input
                                type="text"
                                value={payoutBankName}
                                onChange={e => setPayoutBankName(e.target.value)}
                                placeholder="e.g. First Bank"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Account Name</label>
                            <input
                                type="text"
                                value={payoutAccountName}
                                onChange={e => setPayoutAccountName(e.target.value)}
                                placeholder="e.g. Jane Doe"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Account Number</label>
                            <input
                                type="text"
                                value={payoutAccountNumber}
                                onChange={e => setPayoutAccountNumber(e.target.value)}
                                placeholder="e.g. 0123456789"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Saving..." : "Save Payout Details"}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Security</h3>
                    </div>
                    
                    {!hasRecoveryEvent ? (
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-600 mb-4">
                                To change your password, we first need to send a secure confirmation link to your registered email address. This ensures only you can authorize password changes.
                            </p>
                            <button onClick={handleSendResetLink} disabled={isSendingReset || isResetSent} className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                                {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                {isResetSent ? "Confirmation Link Sent" : "Send Confirmation Email"}
                            </button>
                            {isResetSent && <p className="text-sm text-emerald-600 mt-3 font-medium text-center">Link sent! Check your inbox to continue.</p>}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100 text-sm mb-2">
                                Email verified. Enter your new password below.
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input type="password" value={passwords.confirmPass} onChange={e => setPasswords({ ...passwords, confirmPass: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="w-full flex items-center justify-center gap-2 py-2 border border-transparent bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />} Update Password
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <Bell className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: "New student enrollment", value: notifEnrollment, set: setNotifEnrollment, desc: "Get notified when someone joins your course" },
                            { label: "Course completion alerts", value: notifCompletion, set: setNotifCompletion, desc: "Know when a student finishes your course" },
                            { label: "Marketing emails", value: notifMarketing, set: setNotifMarketing, desc: "Receive tips and platform updates" },
                        ].map(({ label, value, set, desc }) => (
                            <div key={label} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                </div>
                                {/* Custom toggle switch */}
                                <button
                                    onClick={() => set(!value)}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${value ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center ${value ? 'translate-x-6' : 'translate-x-0'
                                        }`}>
                                        {value && <Check className="w-3 h-3 text-emerald-500" />}
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveNotifications}
                            disabled={isSavingNotifs}
                            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSavingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSavingNotifs ? "Saving..." : "Save Preferences"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
