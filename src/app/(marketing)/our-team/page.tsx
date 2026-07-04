"use client";

import * as Icons from "lucide-react";
import { motion } from "framer-motion";

export default function TeamPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-sans min-h-screen pt-36 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        
        {/* Our Team Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-[#092963] mb-6"
          >
            Our Team
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base md:text-lg text-[#092963]/90 leading-relaxed font-medium"
          >
            Our team brings together engineers, economists, policy experts, and entrepreneurs united by one mission: accelerating Africa's clean energy transition. With diverse backgrounds spanning energy markets, sustainable development, and climate finance, we combine technical expertise with on-the-ground experience to turn innovation into impact.
          </motion.p>
        </div>

        {/* Team Members List */}
        <div className="space-y-8">
          
          {/* Member 1: CEO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="bg-[#092963] text-white rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <Icons.User className="w-10 h-10 text-white stroke-[1.5]" />
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ifeoma Malo - CEO & Co-Founder</h3>
              <p className="text-white/95 text-[15px] md:text-base leading-relaxed font-medium max-w-5xl">
                Ifeoma is an organizational management expert with over 23 years of experience in energy policy, infrastructure finance, and large-scale utility markets. Before co-founding Clean Technology Hub, she served as Country Director for Power for All and Senior Technical Adviser to Nigeria's Minister of Power, driving national strategies for electricity access and decentralized renewable energy. She is a Desmond Tutu Fellow, Acumen West Africa Fellow, and Commonwealth Leaders Scholar, and serves on the boards of Greenpeace International, Access to Energy Institute, and Norrenberger Financial Services.
              </p>
            </div>
          </motion.div>

          {/* Member 2: COO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[#2da5cf] text-white rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <Icons.User className="w-10 h-10 text-white stroke-[1.5]" />
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Jacquelyn Mando - Chief Operating Officer</h3>
              <p className="text-white/95 text-[15px] md:text-base leading-relaxed font-medium max-w-5xl">
                Jacquelyn is a management professional with over 10 years of experience in organizational development, leadership, and corporate operations. At Clean Technology Hub, she has led organizational transformation, developed the Sustainable Leadership Project, and established succession planning processes. She holds a BA in International & Comparative Politics from the American University of Nigeria and is a certified trainer under the USAID Power Africa Nigeria Power Sector Program.
              </p>
            </div>
          </motion.div>

          {/* Member 3: CRO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-[#f4c015] text-white rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <Icons.User className="w-10 h-10 text-white stroke-[1.5]" />
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Abel Gaiya - Chief Research Officer</h3>
              <p className="text-white/95 text-[15px] md:text-base leading-relaxed font-medium max-w-5xl">
                Abel holds an MSc in Development Economics from SOAS, University of London. He has led energy access projects at national, state, and local levels in Nigeria, with funding from Heinrich-Böll-Stiftung, IKI, and Acumen West Africa. His work focuses on research-driven solutions to accelerate clean energy adoption across the country.
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
