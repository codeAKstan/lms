"use client";

import { useEffect, useState, useRef } from "react";
import { User, Bell, Lock, CreditCard, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";
import { uploadFile, getAllowedTypes, getMaxSize } from "@/lib/upload";
import {
    getStudentProfile,
    updateStudentProfile,
    getNotificationPreferences,
    updateNotificationPreferences,
    getStudentPayments
} from "@/actions/student/settings";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "billing">("profile");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            <div className="border-b border-gray-200">
                <div className="flex gap-6 overflow-x-auto pb-1">
                    <TabButton icon={<User className="w-5 h-5" />} label="Profile" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
                    <TabButton icon={<Bell className="w-5 h-5" />} label="Notifications" isActive={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} />
                    <TabButton icon={<Lock className="w-5 h-5" />} label="Security" isActive={activeTab === "security"} onClick={() => setActiveTab("security")} />
                    <TabButton icon={<CreditCard className="w-5 h-5" />} label="Billing" isActive={activeTab === "billing"} onClick={() => setActiveTab("billing")} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300">
                {activeTab === "profile" && <ProfileSettings />}
                {activeTab === "notifications" && <NotificationSettings />}
                {activeTab === "security" && <SecuritySettings />}
                {activeTab === "billing" && <BillingSettings />}
            </div>
        </div>
    );
}

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }) {
    return (
        <button
            onClick={onClick}
            className={`pb-3 px-1 font-medium transition-colors border-b-2 flex flex-shrink-0 items-center gap-2 ${isActive
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-gray-900 hover:border-gray-300"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

/** 
 * PROFILE TAB
 */
function ProfileSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
        phone: "", // Note: phone wasn't strictly in DB yet, keeping to mirror UI
        avatar: ""
    });

    useEffect(() => {
        getStudentProfile().then(res => {
            if (res.success && res.data) {
                setFormData({
                    name: res.data.name || "",
                    email: res.data.email || "",
                    bio: res.data.bio || "",
                    phone: "",
                    avatar: res.data.avatar || ""
                });
            }
            setIsLoading(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await updateStudentProfile(formData);
        if (res.success) {
            toast.success("Profile updated successfully");
            window.dispatchEvent(new CustomEvent("student-profile-updated", {
                detail: { name: formData.name, avatar: formData.avatar, bio: formData.bio }
            }));
        } else {
            toast.error(res.error || "Failed to update profile");
        }
        setIsSaving(false);
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
            setFormData(prev => ({ ...prev, avatar: result.url }));
            toast.success("Avatar uploaded! Remember to save.", { id: "avatar-upload" });
        } catch (err) {
            console.error("Upload error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to upload avatar", { id: "avatar-upload" });
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>

            <div className="flex items-start gap-8 mb-6">
                <div className="flex-shrink-0 text-center">
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center relative mb-4 overflow-hidden">
                        {formData.avatar ? (
                            <Image src={formData.avatar} alt="Profile avatar" fill className="object-cover" />
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
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Optional" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea rows={4} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"></textarea>
            </div>

            <button disabled={isSaving} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
            </button>
        </form>
    );
}

/** 
 * NOTIFICATIONS TAB
 */
function NotificationSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [prefs, setPrefs] = useState({
        courseUpdates: true,
        quizReminders: true,
        certificateReady: true,
        marketingEmails: false
    });

    useEffect(() => {
        getNotificationPreferences().then(res => {
            if (res.success && res.data) {
                setPrefs({
                    courseUpdates: res.data.courseUpdates,
                    quizReminders: res.data.quizReminders,
                    certificateReady: res.data.certificateReady,
                    marketingEmails: res.data.marketingEmails
                });
            }
            setIsLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateNotificationPreferences(prefs);
        if (res.success) toast.success("Notification preferences updated");
        else toast.error("Failed to update preferences");
        setIsSaving(false);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-blue-50/50 p-4 border border-blue-100 rounded-xl mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                    <p className="text-sm text-gray-500 mt-1">Control how you want Clean Tech Hub to notify you.</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-white text-sm rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Preferences"}
                </button>
            </div>

            <div className="space-y-4">
                <NotificationToggle label="Course Updates" description="Get notified when instructors post new lessons or content" checked={prefs.courseUpdates} onChange={(val) => setPrefs({ ...prefs, courseUpdates: val })} />
                <NotificationToggle label="Quiz Reminders" description="Remind me to complete pending quizzes" checked={prefs.quizReminders} onChange={(val) => setPrefs({ ...prefs, quizReminders: val })} />
                <NotificationToggle label="Certificate Ready" description="Alert me when my course certificate is ready" checked={prefs.certificateReady} onChange={(val) => setPrefs({ ...prefs, certificateReady: val })} />
                <NotificationToggle label="Marketing Emails" description="Receive emails about new courses and promotions" checked={prefs.marketingEmails} onChange={(val) => setPrefs({ ...prefs, marketingEmails: val })} />
            </div>
        </div>
    );
}

function NotificationToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (val: boolean) => void }) {
    return (
        <div className="flex items-start justify-between p-5 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
            <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer mt-1">
                <input type="checkbox" className="sr-only peer" checked={checked} readOnly />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
        </div>
    );
}

/** 
 * SECURITY TAB
 */
function SecuritySettings() {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [hasRecoveryEvent, setHasRecoveryEvent] = useState(false);
    const [passwords, setPasswords] = useState({
        newPass: "",
        confirmPass: ""
    });

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
        setIsSending(true);
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/student/settings?tab=security`
        });
        
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Confirmation link sent to your email.");
            setIsSent(true);
        }
        setIsSending(false);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPass !== passwords.confirmPass) {
            toast.error("New passwords do not match.");
            return;
        }
        if (passwords.newPass.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setIsSaving(true);
        const { error } = await supabase.auth.updateUser({ password: passwords.newPass });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password secured and updated");
            setPasswords({ newPass: "", confirmPass: "" });
            setHasRecoveryEvent(false); // Reset to default state
        }
        setIsSaving(false);
    };

    if (!hasRecoveryEvent) {
        return (
            <div className="space-y-6 animate-in fade-in max-w-lg">
                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-600 mb-4">
                        To change your password, we first need to send a secure confirmation link to your registered email address. This ensures only you can authorize password changes.
                    </p>
                    <button onClick={handleSendResetLink} disabled={isSending || isSent} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto transition-colors">
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        {isSent ? "Confirmation Link Sent" : "Send Confirmation Email"}
                    </button>
                    {isSent && <p className="text-sm text-emerald-600 mt-3 font-medium">Link sent! Check your inbox and click the link to continue.</p>}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleUpdatePassword} className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-900">Set New Password</h2>
            
            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100 text-sm mb-4">
                You have successfully verified your email. Please enter your new password below.
            </div>

            <div className="space-y-5 max-w-lg">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input type="password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                    <input type="password" value={passwords.confirmPass} onChange={e => setPasswords({ ...passwords, confirmPass: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>

                <div className="pt-2">
                    <button disabled={isSaving} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2">
                        {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Password"}
                    </button>
                </div>
            </div>
        </form>
    );
}

/** 
 * BILLING TAB
 */
function BillingSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [payments, setPayments] = useState<{ id: string; courseTitle: string; amount: number; currency: string; date: Date; status: string }[]>([]);

    useEffect(() => {
        getStudentPayments().then((res) => {
            if (res.success && res.data) {
                setPayments(res.data);
            }
            setIsLoading(false);
        });
    }, []);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-900">Payment History</h2>

            {payments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border border-gray-100 rounded-2xl">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No previous purchase records found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {payments.map(payment => (
                        <PaymentRecord
                            key={payment.id}
                            course={payment.courseTitle}
                            amount={payment.amount}
                            currency={payment.currency}
                            date={new Date(payment.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                            status={payment.status.toLowerCase()}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function PaymentRecord({ course, amount, currency, date, status }: { course: string; amount: number; currency: string; date: string; status: string; }) {
    // Basic human-readable format for cents depending on currency logic (assuming NGN/USD raw format or cents)
    const formattedAmount = `${currency === "NGN" ? "₦" : "$"}${(amount / 100).toLocaleString()}`;

    return (
        <div className="flex items-center justify-between p-5 border border-gray-100 bg-gray-50/50 hover:bg-white rounded-2xl transition-colors">
            <div>
                <p className="font-bold text-gray-900 mb-1 leading-tight max-w-[280px] md:max-w-md truncate title">{course}</p>
                <p className="text-xs font-medium text-gray-500">{date}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-gray-900 text-lg mb-1">{formattedAmount}</p>
                <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md ${status === "completed" ? "bg-success/10 text-success" :
                        status === "failed" ? "bg-red-100 text-red-600" :
                            "bg-yellow-100 text-yellow-700"
                    }`}>
                    {status}
                </span>
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );
}
