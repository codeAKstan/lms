"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Contact Inquiry",
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
        setFormData({ name: "", email: "", subject: "Contact Inquiry", message: "" });
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
    <div className="bg-white min-h-screen text-[#191c1e] font-sans pt-36 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Contact Details */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#092963] tracking-tight">
              Get in Touch
            </h1>
            <p className="text-base md:text-[17px] text-[#092963] font-semibold leading-relaxed max-w-sm">
              Get in touch with by filling out the form or via the contact details below.
            </p>

            <div className="flex flex-col gap-6 mt-4">
              {/* Location */}
              <div className="flex gap-4 items-start">
                <Icons.MapPin className="w-7 h-7 text-[#092963] shrink-0 stroke-[1.5]" />
                <span className="text-[15px] md:text-base text-[#092963] font-semibold leading-relaxed">
                  1 Sarki Tafida Street, Guzape, F.C.T, Abuja
                </span>
              </div>
              {/* Email */}
              <div className="flex gap-4 items-start">
                <Icons.Mail className="w-7 h-7 text-[#092963] shrink-0 stroke-[1.5]" />
                <span className="text-[15px] md:text-base text-[#092963] font-semibold">
                  hello@cleantechnologyhub.org
                </span>
              </div>
              {/* Phone */}
              <div className="flex gap-4 items-start">
                <Icons.Phone className="w-7 h-7 text-[#092963] shrink-0 stroke-[1.5]" />
                <div className="flex flex-col text-[15px] md:text-base text-[#092963] font-semibold">
                  <span>+2348096024444</span>
                  <span>+2348139186502</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="lg:col-span-7"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Grid: Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-extrabold text-[#092963] tracking-wide">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-[#2da5cf] text-[#092963] placeholder-[#092963]/75 font-semibold px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#092963] transition-all"
                  />
                </div>
                {/* Email field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-extrabold text-[#092963] tracking-wide">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-[#2da5cf] text-[#092963] placeholder-[#092963]/75 font-semibold px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#092963] transition-all"
                  />
                </div>
              </div>

              {/* Message field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-extrabold text-[#092963] tracking-wide">How can we help?</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your enterprise needs"
                  required
                  rows={6}
                  className="w-full bg-[#2da5cf] text-[#092963] placeholder-[#092963]/75 font-semibold px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#092963] transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#092963] hover:bg-[#051e44] text-white font-bold text-center py-4.5 rounded-xl transition-all duration-200 text-[16px]"
                >
                  {isSubmitting ? "Sending..." : "Get in touch"}
                </button>
              </div>

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
