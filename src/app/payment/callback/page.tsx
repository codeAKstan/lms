"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

function PaymentCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        async function verify() {
            const reference = searchParams?.get('reference');

            if (!reference) {
                setStatus('error');
                return;
            }

            try {
                const res = await fetch('/api/payments/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus('success');
                    toast.success("Payment verified! Redirecting to course...");
                    setTimeout(() => router.push('/student/courses'), 2000);
                } else {
                    setStatus('error');
                    toast.error(data.error || "Verification failed");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus('error');
            }
        }

        verify();
    }, [searchParams, router]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">Verifying Payment</h2>
                        <p className="text-gray-500 mt-2">Please wait while we confirm your transaction...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
                        <p className="text-gray-500 mt-2">You are now enrolled.</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
                        <p className="text-gray-500 mt-2">Could not verify payment. Please contact support.</p>
                        <button
                            onClick={() => router.push('/courses')}
                            className="mt-6 w-full py-2 bg-gray-900 text-white rounded-lg"
                        >
                            Return to Courses
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    );
}
