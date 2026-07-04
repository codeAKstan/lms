import Link from "next/link";
import { Building2, ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui";

export default function BusinessComingSoonPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-cool-grey px-4 text-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-sea-mist rounded-full flex items-center justify-center mb-6 text-primary">
                    <Building2 className="w-10 h-10" />
                </div>
                
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cth-yellow/20 text-[#B08A00] font-bold text-xs uppercase tracking-wider mb-4 border border-cth-yellow/30">
                    <Construction className="w-3.5 h-3.5" />
                    In Development
                </span>

                <h1 className="text-3xl font-bold text-cth-blue mb-4">
                    Clean Tech Hub for Business
                </h1>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                    We are currently building the ultimate enterprise solution for organizations to upskill their workforce in the green economy.
                    <br /><br />
                    Expected launch: <span className="font-semibold text-gray-900">Coming Soon</span>
                </p>

                <Link href="/" className="w-full">
                    <Button variant="primary" size="lg" className="w-full font-bold gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Return Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
