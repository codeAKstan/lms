"use client";

import { useEffect, useState } from "react";
import { Award, Loader2, Filter, Share2, Calendar, Download, Copy, ChevronRight, Check, X, Linkedin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getStudentCertificates } from "@/actions/student/certificates";
import { toast } from "sonner";

type Certificate = {
    id: string;
    courseName: string;
    issuedAt: string;
    verificationCode: string;
    level?: string;
};

export default function CertificatesPage() {
    const { user } = useAuth();
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        getStudentCertificates(user.id).then(res => {
            if (res.success && res.data) {
                const certsWithLevel = (res.data as Certificate[]).map(c => ({
                    ...c,
                    level: c.level || "PROFESSIONAL"
                }));
                setCerts(certsWithLevel);
            }
            setIsLoading(false);
        });
    }, [user]);

    const filteredCerts = activeFilter === "ALL"
        ? certs
        : certs.filter(c => c.level === activeFilter);

    // Derive available filter levels from actual DB data
    const availableLevels = ["ALL", ...Array.from(new Set(certs.map(c => c.level || "PROFESSIONAL")))];

    const handleCopyProfileLink = async () => {
        const profileUrl = `${window.location.origin}/verify/${user?.id}`;
        try {
            await navigator.clipboard.writeText(profileUrl);
            toast.success("Profile link copied to clipboard!", {
                description: profileUrl,
                icon: <Check className="w-4 h-4 text-green-500" />,
            });
        } catch {
            toast.error("Could not copy to clipboard. Please try again.");
        }
    };

    const handleShareCert = async (cert: Certificate) => {
        const verifyUrl = `${window.location.origin}/verify/${cert.verificationCode}`;
        try {
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share({
                    title: `My Certificate: ${cert.courseName}`,
                    text: `I just earned a certificate in ${cert.courseName} from CTH EdTech!`,
                    url: verifyUrl,
                });
            } else {
                await navigator.clipboard.writeText(verifyUrl);
                toast.success("Verification link copied!", {
                    description: "Share this link to verify your certificate.",
                    icon: <Check className="w-4 h-4 text-green-500" />,
                });
            }
        } catch (err) {
            // User cancelled share sheet — silently ignore
            if ((err as Error).name !== "AbortError") {
                toast.error("Could not share certificate.");
            }
        }
    };

    const handleLinkedIn = () => {
        const params = new URLSearchParams({
            startTask: "CERTIFICATION_NAME",
            name: "CTH EdTech Certificate",
            organizationId: "cth-edtech",
            issueYear: new Date().getFullYear().toString(),
            issueMonth: (new Date().getMonth() + 1).toString(),
            certUrl: `${window.location.origin}/student/certificates`,
            certId: user?.id || "",
        });
        window.open(
            `https://www.linkedin.com/profile/add?${params.toString()}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-[#00153e]" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
                        <Link href="/student/courses" className="hover:text-[#00153e] transition-colors">My Learning</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-[#00153e] font-bold">Certificates</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#00153e] tracking-tight mb-4">
                        Academic Achievements
                    </h1>
                    <p className="text-lg text-[#444650] leading-relaxed">
                        Your verified credentials for clean technology, sustainable policy, and climate innovation across the African continent.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Filter — toggles filter pills below */}
                    <button
                        onClick={() => setIsFilterOpen(prev => !prev)}
                        className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                            isFilterOpen
                                ? "bg-[#00153e] text-white border-[#00153e]"
                                : "bg-white text-[#00153e] border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {isFilterOpen ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                        Filter
                    </button>
                    {/* Public Profile — copies the shareable profile URL */}
                    <button
                        onClick={handleCopyProfileLink}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#00153e] border border-[#00153e] rounded-xl text-sm font-semibold text-white hover:bg-[#002870] transition-colors shadow-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        Public Profile
                    </button>
                </div>
            </div>

            {/* Filter Pills — only show when toggled open and there are certs */}
            {isFilterOpen && certs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 -mt-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Filter by level:</span>
                    {availableLevels.map(level => (
                        <button
                            key={level}
                            onClick={() => setActiveFilter(level)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                activeFilter === level
                                    ? "bg-[#00153e] text-white border-[#00153e] shadow-sm"
                                    : "bg-white text-[#444650] border-gray-200 hover:border-[#00153e] hover:text-[#00153e]"
                            }`}
                        >
                            {level}
                            {level !== "ALL" && (
                                <span className="ml-1.5 opacity-60">({certs.filter(c => c.level === level).length})</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Certificates Grid */}
            {certs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#f7f9fb] rounded-full flex items-center justify-center mb-6">
                        <Award className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-[#00153e] mb-2">No certificates yet</h2>
                    <p className="text-[#444650] max-w-sm mb-8 leading-relaxed">
                        Complete a course to earn your first certificate. Certificates are awarded upon 100% course completion.
                    </p>
                    <Link
                        href="/student/courses"
                        className="px-8 py-3 bg-[#90efef] text-[#00153e] rounded-xl font-bold hover:bg-[#72e5e5] transition-all shadow-sm"
                    >
                        Continue Learning
                    </Link>
                </div>
            ) : filteredCerts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
                    <Filter className="w-10 h-10 text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-[#00153e] mb-1">No {activeFilter} certificates</h3>
                    <p className="text-gray-500 text-sm">You have no certificates at this level. Try a different filter.</p>
                    <button
                        onClick={() => setActiveFilter("ALL")}
                        className="mt-4 text-sm font-semibold text-[#006a6a] hover:underline"
                    >
                        Show all certificates
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCerts.map(cert => (
                        <div
                            key={cert.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                        >
                            {/* Certificate Thumbnail (stylised CSS — no mock data) */}
                            <div className="h-48 bg-[#f5f7fa] relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-2 border-4 border-double border-gray-300 rounded-lg opacity-50"></div>
                                <div className="absolute inset-4 border border-gray-200 opacity-50"></div>
                                <div className="text-center z-10 p-4">
                                    <h4 className="font-serif text-2xl font-bold text-gray-800 tracking-wider mb-2 uppercase opacity-80">Certificate</h4>
                                    <p className="text-xs text-gray-500 font-medium">OF COMPLETION</p>
                                    <div className="mt-4 flex justify-center">
                                        <Award className="w-10 h-10 text-amber-500 opacity-90" />
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 bg-[#90efef] text-[#00153e] text-[10px] font-bold tracking-widest uppercase rounded">
                                        {cert.level}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-[#757781] font-medium">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {cert.issuedAt}
                                    </div>
                                </div>

                                <h3 className="font-bold text-xl text-[#00153e] leading-snug line-clamp-2 mb-6 flex-1">
                                    {cert.courseName}
                                </h3>

                                <div className="flex items-center gap-3 mt-auto">
                                    {/* Download — goes to the cert preview/PDF page */}
                                    <Link
                                        href={`/student/certificates/${cert.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00153e] hover:bg-[#002870] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </Link>
                                    {/* Share — copies verification URL or opens native share sheet */}
                                    <button
                                        onClick={() => handleShareCert(cert)}
                                        className="flex items-center justify-center p-2.5 border border-gray-200 hover:bg-gray-50 hover:border-[#006a6a] rounded-xl text-[#00153e] transition-all shadow-sm flex-shrink-0"
                                        title="Share Certificate"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* External Credentials API Banner */}
            <div className="bg-[#00153e] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#092962]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#90efef]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative z-10 max-w-xl">
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                        External Credentials API
                    </h2>
                    <p className="text-[#90efef] text-lg leading-relaxed font-medium">
                        Share your learning progress directly with employers through our secure Verification API. LinkedIn-ready and blockchain-verified.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 flex-shrink-0 w-full md:w-auto">
                    {/* Connect LinkedIn — deep-links to LinkedIn add certification page */}
                    <button
                        onClick={handleLinkedIn}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#90efef] hover:bg-[#72e5e5] text-[#00153e] font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
                    >
                        <Linkedin className="w-5 h-5" />
                        Connect LinkedIn
                    </button>
                    {/* Copy Profile Link — copies the student's public achievements URL */}
                    <button
                        onClick={handleCopyProfileLink}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent border border-[#092962] hover:bg-[#092962]/50 text-[#90efef] font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                    >
                        <Copy className="w-5 h-5" />
                        Copy Profile Link
                    </button>
                </div>
            </div>
        </div>
    );
}
