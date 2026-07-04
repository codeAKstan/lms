"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white border-b border-gray-100 fixed top-0 w-full z-50">
            <div className="container mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/Logo.webp" alt="CTH EdTech Logo" width={32} height={32} className="object-contain" />
                    <span className="font-extrabold text-xl text-[#00153e] tracking-tight">CTH EdTech</span>
                </Link>

                {/* Center Nav Links */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link href="/courses" className="text-sm font-semibold text-[#006a6a] border-b-2 border-[#006a6a] pb-1">Courses</Link>
                    <Link href="/learning-paths" className="text-sm font-semibold text-[#444650] hover:text-[#191c1e] transition-colors pb-1">Pathways</Link>
                    <Link href="/about" className="text-sm font-semibold text-[#444650] hover:text-[#191c1e] transition-colors pb-1">About</Link>
                </nav>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/login" className="text-sm font-semibold text-[#444650] hover:text-[#191c1e] transition-colors">
                        Login
                    </Link>
                    <Link href="/register" className="bg-[#00153e] hover:bg-[#00153e]/90 text-white text-sm font-bold py-2.5 px-6 rounded transition-colors">
                        Enroll Now
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden p-2 text-[#191c1e]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-lg absolute w-full">
                    <Link href="/courses" className="text-[#006a6a] font-bold" onClick={() => setIsMenuOpen(false)}>Courses</Link>
                    <Link href="/learning-paths" className="text-[#444650] font-semibold" onClick={() => setIsMenuOpen(false)}>Pathways</Link>
                    <Link href="/about" className="text-[#444650] font-semibold" onClick={() => setIsMenuOpen(false)}>About</Link>
                    <hr className="my-2 border-gray-100" />
                    <Link href="/login" className="text-[#444650] font-semibold" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    <Link href="/register" className="bg-[#00153e] text-center text-white font-bold py-3 rounded mt-2" onClick={() => setIsMenuOpen(false)}>Start Free</Link>
                </div>
            )}
        </header>
    );
}
