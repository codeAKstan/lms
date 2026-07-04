"use client";

import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-sans min-h-screen pt-36 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* About Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-[#092963] mb-6"
          >
            About Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base md:text-lg text-[#092963]/90 leading-relaxed font-medium"
          >
            Clean Technology Hub is Nigeria's first energy innovation center, founded in 2016 in Abuja with virtual hubs across the country. We guide clean energy ideas from research to market through incubation, demonstration, and commercial validation. As an early-stage startup incubator, a consultancy for sustainability and energy efficiency solutions, and a catalyst for climate-smart investments, we are driving Africa's transition to a cleaner future.
          </motion.p>
        </div>

        {/* Mission, Vision, Values section */}
        <div className="space-y-8 mb-16">
          
          {/* Mission Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="bg-[#092963] text-white rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <Icons.Target className="w-10 h-10 text-white stroke-[1.5]" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Our Mission</h2>
              <p className="text-white/95 text-[15px] md:text-base leading-relaxed font-medium max-w-3xl">
                Building ecosystems and community of practice that are focused on practical innovations to address energy poverty, climate change, and sustainable economic development,
              </p>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[#2da5cf] text-white rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <Icons.Star className="w-10 h-10 text-white stroke-[1.5]" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Our Vision</h2>
              <p className="text-white/95 text-[15px] md:text-base leading-relaxed font-medium max-w-3xl">
                Drive energy access in Africa through novelty in clean technologies, research in sustainable energy and development of access models as well as advocate for climate action.
              </p>
            </div>
          </motion.div>

          {/* Purpose and Values Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-[#f4c015] text-white rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <Icons.BookOpen className="w-10 h-10 text-white stroke-[1.5]" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Our Purpose and Values</h2>
              <p className="text-white/95 text-[15px] md:text-base leading-relaxed font-medium max-w-4xl mb-4">
                Our goal is to drive energy access in Africa through novelty in clean energy technologies, research in sustainable energy development and development of energy access models that can be adopted in various African countries. We also aim to grow the next generation of Africa's clean energy leaders.
              </p>
              <p className="text-white/95 text-[15px] md:text-base leading-relaxed font-medium max-w-4xl">
                Our purpose is brought to life through our four core values: Excellent client service, Resourcefulness, Teamwork and Partnership.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Live Text Stream Section in Mission & Vision */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white py-14 overflow-hidden relative w-full rounded-[2rem] border border-gray-100/50"
        >
          {/* Left and Right gradient overlays to fade text in and out */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

          <div className="w-full overflow-hidden flex">
            <div className="flex gap-16 animate-marquee-custom whitespace-nowrap">
              {Array(6).fill([
                { text: "Build.", color: "text-[#092963]" },
                { text: "Inspire.", color: "text-[#2da5cf]" },
                { text: "Scale.", color: "text-[#092963]" },
                { text: "Lead.", color: "text-[#2da5cf]" }
              ]).flat().map((item, idx) => (
                <span 
                  key={idx} 
                  className={`text-5xl md:text-6xl font-extrabold tracking-tight ${item.color}`}
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes marqueeCustom {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-marquee-custom {
              display: flex;
              animation: marqueeCustom 25s linear infinite;
            }
          `}} />
        </motion.div>

      </div>
    </div>
  );
}
