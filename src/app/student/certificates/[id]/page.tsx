"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Download, Share2, Award, SearchX } from "lucide-react";
import Image from "next/image";
import { getCertificatePreview } from "@/actions/student/certificates";

export default function CertificatePage() {
    const params = useParams();
    const id = params?.id as string;

    const [certificate, setCertificate] = useState<{
        studentName: string;
        courseName: string;
        issuedAt: string;
        verificationCode: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        getCertificatePreview(id).then(res => {
            if (res.success && res.data) {
                setCertificate({
                    studentName: res.data.studentName,
                    courseName: res.data.courseName,
                    issuedAt: res.data.issuedAt,
                    verificationCode: res.data.verificationCode
                });
            } else {
                setError(res.error || "Certificate not found");
            }
            setLoading(false);
        });
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Verifying credentials...</p>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <SearchX className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
                <p className="text-gray-500 max-w-md">The certificate ID you are looking for does not exist or may have been revoked. Please check the URL and try again.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 print:bg-white print:p-0 print:py-0">
            {/* Actions */}
            <div className="mb-8 flex gap-4 print:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 font-medium"
                >
                    <Download className="w-5 h-5" /> Download PDF
                </button>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Certificate link copied to clipboard!");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
                >
                    <Share2 className="w-5 h-5" /> Copy Link
                </button>
            </div>

            {/* Certificate Frame */}
            <div className="bg-white p-3 md:p-5 shadow-2xl shadow-gray-200/50 rounded-[20px] max-w-5xl w-full aspect-[1.414/1] relative print:shadow-none print:w-full print:h-screen animate-in fade-in zoom-in-95 duration-700">
                <div className="border-[12px] border-double border-emerald-900/90 h-full w-full p-8 md:p-14 flex flex-col items-center justify-center text-center relative overflow-hidden bg-[#faf9f6]">

                    {/* Background Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>

                    {/* Corner Ornaments */}
                    <div className="absolute top-0 left-0 w-40 h-40 border-t-[12px] border-l-[12px] border-emerald-600/80 rounded-tl-[40px] opacity-60"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 border-t-[12px] border-r-[12px] border-emerald-600/80 rounded-tr-[40px] opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 border-b-[12px] border-l-[12px] border-emerald-600/80 rounded-bl-[40px] opacity-60"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 border-b-[12px] border-r-[12px] border-emerald-600/80 rounded-br-[40px] opacity-60"></div>

                    {/* Logo/Icon */}
                    <div className="mb-8 text-emerald-800 relative z-10">
                        <Award className="w-24 h-24 mx-auto mb-3" strokeWidth={1} />
                        <h2 className="text-2xl font-bold uppercase tracking-[0.4em] text-emerald-900">Clean Tech Hub</h2>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-8 tracking-tight">Certificate of Completion</h1>

                    <p className="text-gray-500 text-lg md:text-xl italic mb-8 font-serif">This is to officially certify that</p>

                    <div className="text-4xl md:text-5xl font-bold text-emerald-900 border-b-2 border-emerald-900/30 pb-4 px-16 mb-8 font-serif w-full max-w-3xl overflow-hidden text-ellipsis whitespace-nowrap title">
                        {certificate.studentName}
                    </div>

                    <p className="text-gray-500 text-lg md:text-xl italic mb-6 font-serif">has successfully completed the comprehensive program in</p>

                    <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-14 px-8 leading-tight">
                        {certificate.courseName}
                    </h3>

                    {/* Signatures & Verification */}
                    <div className="flex w-full justify-between items-end mt-auto px-12 md:px-20 relative z-10">
                        <div className="text-center w-64">
                            <div className="h-[2px] w-full bg-gray-800 mb-3 opacity-80"></div>
                            <p className="text-lg font-bold text-gray-900 font-serif">Dr. Sarah Green</p>
                            <p className="text-sm text-emerald-700 uppercase tracking-widest font-bold mt-1">Director of Education</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-28 h-28 mb-3 bg-white p-2 border shadow-sm mix-blend-multiply">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : certificate.verificationCode)}`}
                                        alt="Verification QR Code"
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-mono text-gray-500 mb-1">ID: {certificate.verificationCode}</p>
                                <p className="text-xs font-mono text-gray-500">Issued: <span className="text-gray-700 font-medium">{certificate.issuedAt}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
