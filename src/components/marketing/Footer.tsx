"use client";

import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Rss } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#00153e] text-white pt-16 pb-8">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Image src="/Logo.webp" alt="CTH EdTech Logo" width={32} height={32} className="object-contain brightness-0 invert" />
                            <span className="font-extrabold text-xl text-white tracking-tight">CTH EdTech</span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                            Accelerating climate innovation across the continent through high-end professional education and research.
                        </p>
                    </div>

                    {/* Learning */}
                    <div>
                        <h4 className="font-bold text-sm text-[#90efef] mb-6">Learning</h4>
                        <ul className="space-y-4">
                            <li><Link href="/courses" className="text-white/80 hover:text-white text-sm transition-colors">All Courses</Link></li>
                            <li><Link href="/learning-paths" className="text-white/80 hover:text-white text-sm transition-colors">Pathways</Link></li>
                            <li><Link href="/courses" className="text-white/80 hover:text-white text-sm transition-colors">Certifications</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-bold text-sm text-[#90efef] mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-white/80 hover:text-white text-sm transition-colors">SDG Impact</Link></li>
                            <li><Link href="/privacy" className="text-white/80 hover:text-white text-sm transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="text-white/80 hover:text-white text-sm transition-colors">Terms</Link></li>
                        </ul>
                    </div>

                    {/* Stay Connected */}
                    <div>
                        <h4 className="font-bold text-sm text-[#90efef] mb-6">Stay Connected</h4>
                        <p className="text-white/80 text-sm mb-4">Newsletter Signup</p>
                        <form className="flex" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                className="bg-[#092962] border border-[#ffffff]/10 text-white px-4 py-2 text-sm focus:outline-none focus:border-[#90efef] w-full"
                            />
                            <button type="submit" className="bg-[#006a6a] hover:bg-[#008080] px-3 flex items-center justify-center transition-colors">
                                <span className="text-white font-bold">&gt;</span>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/50 text-xs">
                        © {new Date().getFullYear()} CTH EdTech. Accelerating climate innovation across the continent.
                    </p>
                    <div className="flex items-center gap-4 text-white/50">
                        <a href="#" className="hover:text-white transition-colors"><Rss className="w-4 h-4" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
