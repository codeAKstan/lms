import Image from "next/image";
import { Leaf } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        // Full-height centering wrapper — accounts for fixed header (h-20 = 80px)
        // Card floats perfectly centered in the available viewport space
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
            <div className="flex w-full max-w-[920px] bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* Left Column — hidden on mobile */}
                <div className="relative hidden w-[45%] flex-col justify-center overflow-hidden bg-primary p-8 text-white lg:flex">
                    {/* Background Image — crop pulled down so panels fill center frame */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop"
                            alt="Solar panels"
                            fill
                            className="object-cover object-[50%_60%]"
                            priority
                        />
                        {/* Heavier overlay at bottom for text legibility, lighter at top so panels show */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
                    </div>

                    {/* Content — vertically centered, not pinned to bottom */}
                    <div className="relative z-10">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#008A5E] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <Leaf className="h-3 w-3" />
                            Climate Innovation
                        </div>

                        <h1 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight">
                            Empowering the next generation of African climate leaders.
                        </h1>

                        <p className="mb-6 text-sm text-white/90 leading-relaxed">
                            Join 50,000+ professionals mastering clean technology and sustainable development across the continent.
                        </p>

                        <div className="flex items-center gap-6 border-t border-white/20 pt-5">
                            <div>
                                <p className="mb-1.5 text-[8px] font-bold uppercase tracking-widest text-white/70">
                                    Accredited By
                                </p>
                                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                                    <span>UNESCO</span>
                                    <span>UNEP</span>
                                </div>
                            </div>
                            <div>
                                <p className="mb-1.5 text-[8px] font-bold uppercase tracking-widest text-white/70">
                                    SDG Aligned
                                </p>
                                <div className="flex gap-1">
                                    <div className="h-3.5 w-3.5 rounded-sm bg-[#4C9F38]"></div>
                                    <div className="h-3.5 w-3.5 rounded-sm bg-[#00689D]"></div>
                                    <div className="h-3.5 w-3.5 rounded-sm bg-[#FCC30B]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex w-full flex-col lg:w-[55%]">
                    <div className="flex-1 flex flex-col justify-center px-8 sm:px-10 md:px-12 py-8">
                        {/* Logo & Brand */}
                        <div className="mb-6 flex items-center justify-center gap-3">
                            <Image
                                src="/Logo.webp"
                                alt="CTH EdTech Logo"
                                width={32}
                                height={32}
                                className="h-7 w-auto"
                            />
                            <span className="text-lg font-black tracking-tight text-accent">
                                CTH EdTech
                            </span>
                        </div>

                        <div className="mb-5">
                            <h2 className="mb-1.5 text-xl font-bold text-accent">{title}</h2>
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        </div>

                        {/* Social Logins */}
                        <div className="mb-4 grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 rounded-xl border border-muted bg-white py-2 text-xs font-semibold text-accent transition-colors hover:bg-surface">
                                <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={16} height={16} />
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-xl border border-muted bg-white py-2 text-xs font-semibold text-accent transition-colors hover:bg-surface">
                                <Image src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" width={16} height={16} />
                                LinkedIn
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-muted"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px]">
                                <span className="bg-white px-3 font-bold uppercase tracking-wider text-muted-foreground">
                                    Or email
                                </span>
                            </div>
                        </div>

                        {/* Form slot */}
                        {children}

                        {/* Testimonial */}
                        <div className="mt-6 flex flex-col items-center border-t border-muted pt-4 text-center">
                            <div className="mb-2 flex -space-x-2">
                                <Image src="https://i.pravatar.cc/100?img=1" alt="User 1" width={24} height={24} className="rounded-full border-2 border-white" />
                                <Image src="https://i.pravatar.cc/100?img=2" alt="User 2" width={24} height={24} className="rounded-full border-2 border-white" />
                                <Image src="https://i.pravatar.cc/100?img=3" alt="User 3" width={24} height={24} className="rounded-full border-2 border-white" />
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-muted text-[8px] font-bold text-muted-foreground">
                                    +5k
                                </div>
                            </div>
                            <p className="text-xs italic text-muted-foreground">
                                &quot;The most comprehensive platform for clean tech in Africa.&quot; — Sarah J.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
