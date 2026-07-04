"use client";

import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            
            if (data.success) {
                alert("Thank you for your message! We'll get back to you soon.");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                alert("Failed to send message: " + data.error);
            }
        } catch (error) {
            console.error("Contact form error:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="bg-white min-h-screen font-sans text-gray-900">
            {/* Hero Section */}
            <section className="py-20 bg-teal-50 border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <span className="inline-block py-1 px-3 mb-2 rounded border border-teal-600 text-teal-700 font-bold uppercase tracking-wider text-sm bg-white">
                            Contact Us
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                            Get in Touch
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="p-10 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="john@example.com"
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="How can we help you?"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="Tell us more about your inquiry..."
                                            required
                                        />
                                    </div>
                                    <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="gap-2 font-bold py-3 px-8 w-full md:w-auto">
                                        <Send className="w-5 h-5" />
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            <ContactInfoCard
                                icon={<Mail className="w-6 h-6 text-teal-700" />}
                                title="Email Us"
                                content="mails@cleantechnologyhub.org"
                                description="We'll respond within 24 hours"
                            />
                            <ContactInfoCard
                                icon={<Phone className="w-6 h-6 text-teal-700" />}
                                title="Call Us"
                                content="+234 809 602 4444"
                                description="24/7 Support"
                            />
                            <ContactInfoCard
                                icon={<MapPin className="w-6 h-6 text-teal-700" />}
                                title="Visit Us"
                                content="1, Sarki Tafida St. Guzape, Abuja FCT"
                                description="Available for on-site consultations"
                            />
                            <ContactInfoCard
                                icon={<Clock className="w-6 h-6 text-teal-700" />}
                                title="Office Hours"
                                content="Mon - Fri: 9AM - 5PM"
                                description="Sat - Sun: Closed"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Google Map Section */}
            <section className="py-16 bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
                            <p className="text-gray-600">Visit our office in Guzape, Abuja</p>
                        </div>
                        <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3939.869407!2d7.497!3d9.073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDQnMjIuOCJOIDfCsDI5JzQ5LjIiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full"
                            ></iframe>
                        </div>
                        <div className="mt-6 text-center">
                            <a
                                href="https://maps.google.com/?q=1+Sarki+Tafida+St+Guzape+Abuja"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-700 hover:text-teal-800 hover:underline font-bold"
                            >
                                Open in Google Maps →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-teal-900 text-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Prefer to Explore on Your Own?
                        </h2>
                        <p className="text-xl text-teal-100">
                            Check out our courses and start learning today
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Link href="/courses">
                                <Button variant="secondary" size="lg" className="font-bold py-4 px-8 text-lg text-teal-900 border-transparent">
                                    Browse Courses
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="outline" size="lg" className="font-bold py-4 px-8 text-lg border-white text-white hover:bg-white/10 bg-transparent">
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ContactInfoCard({ icon, title, content, description }: {
    icon: React.ReactNode;
    title: string;
    content: string;
    description: string;
}) {
    return (
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-base font-semibold text-gray-700 mb-1">{content}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
}
