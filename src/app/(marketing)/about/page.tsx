"use client";

import { Target, Lightbulb, ArrowRight, Globe, Zap, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";

export default function AboutPage() {
    return (
        <div className="bg-white text-gray-900 font-sans min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 flex items-center overflow-hidden bg-teal-50 border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <span className="inline-block py-1 px-3 mb-4 rounded border border-teal-600 text-teal-700 font-bold uppercase tracking-wider text-sm bg-white">
                            About Us
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                            Building a Sustainable Future Through
                            <span className="block text-teal-700 mt-2">Education & Innovation</span>
                        </h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mt-6">
                            CTH EdTech is on a mission to empower individuals and organizations
                            with the skills and knowledge needed to drive climate action and technological innovation.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Story</h2>
                            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                                <p>
                                    Founded with a vision to bridge the gap between technology and sustainability,
                                    CTH EdTech was born from the understanding that education is the
                                    cornerstone of meaningful climate action.
                                </p>
                                <p>
                                    We recognized that while clean technology solutions exist, there&apos;s a critical
                                    shortage of skilled professionals who can implement, manage, and innovate in
                                    this space. Our platform addresses this gap by offering practical, hands-on
                                    training that combines technical expertise with sustainability principles.
                                </p>
                                <p>
                                    Today, we&apos;re proud to serve thousands of learners across Nigeria and beyond,
                                    helping them build careers in the growing green economy while making a real
                                    impact on climate change.
                                </p>
                            </div>
                            <Link href="/courses">
                                <Button variant="primary" size="lg" className="mt-6 gap-2 font-bold py-3 px-6 text-lg">
                                    Explore Our Courses
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                        <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl border border-gray-100">
                            <Image
                                src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=2560&auto=format&fit=crop"
                                alt="Team collaboration"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 bg-gray-50 border-y border-gray-200">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            These principles guide everything we do as an organization
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        <ValueCard
                            icon={<Target className="w-10 h-10 text-teal-700" />}
                            title="Impact-Driven"
                            description="Every course is designed to create real-world impact on climate change and sustainability."
                        />
                        <ValueCard
                            icon={<Lightbulb className="w-10 h-10 text-teal-700" />}
                            title="Innovative"
                            description="We embrace cutting-edge technology and teaching methods to deliver the best learning experience."
                        />
                        <ValueCard
                            icon={<Heart className="w-10 h-10 text-teal-700" />}
                            title="Inclusive"
                            description="Quality education should be accessible to everyone, regardless of background or location."
                        />
                        <ValueCard
                            icon={<Globe className="w-10 h-10 text-teal-700" />}
                            title="Sustainable"
                            description="We practice what we teach, operating with minimal environmental impact and maximum efficiency."
                        />
                    </div>
                </div>
            </section>

            {/* Impact Metrics Section */}
            <section className="py-24 bg-teal-900 text-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                            Our Impact in Numbers
                        </h2>
                        <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                            Making a difference, one learner at a time
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto border-t border-teal-800 pt-16">
                        <ImpactMetric number="3,500+" label="Active Learners" />
                        <ImpactMetric number="24+" label="Expert Instructors" />
                        <ImpactMetric number="45+" label="Courses Available" />
                        <ImpactMetric number="92%" label="Completion Rate" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto p-12 text-center bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                        <Zap className="w-12 h-12 text-teal-600 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join thousands of learners building careers in clean technology
                            and making a real impact on climate change.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register">
                                <Button variant="primary" size="lg" className="font-bold py-3 px-8 text-lg">
                                    Get Started Free
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" size="lg" className="border-teal-600 text-teal-700 hover:bg-teal-50 font-bold py-3 px-8 text-lg">
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="mb-4 flex justify-center">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
        </div>
    );
}

function ImpactMetric({ number, label }: { number: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-5xl font-bold mb-2 text-white">{number}</div>
            <div className="text-base text-teal-200 font-medium uppercase tracking-wider">{label}</div>
        </div>
    );
}
