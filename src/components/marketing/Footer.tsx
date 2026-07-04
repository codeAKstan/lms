"use client";

import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const menuLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Our Work", href: "/our-work" },
    { label: "Stories", href: "/blog" },
    { label: "Resources", href: "/resources" },
    { label: "Get Involved", href: "/get-involved" },
    { label: "Contact Us", href: "/contact" },
  ];

  const socialLinks = [
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    { label: "Twitter", href: "https://twitter.com", icon: Twitter },
    { label: "Instagram", href: "https://instagram.com", icon: Instagram },
    { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  ];

  return (
    <footer className="bg-[#051e44] text-white pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">

          {/* Brand Info Column */}
          <div className="col-span-1 lg:col-span-5 flex flex-col items-start">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo.png"
                alt="Clean Technology Hub"
                width={400}
                height={100}
                className="h-40 w-auto object-contain"
                priority
              />
            </Link>
            <p className="text-white/90 text-[15px] leading-relaxed font-medium mb-8 max-w-md">
              Innovative strategies backed by data-driven insights, delivering measurable success and unstoppable growth for your business.
            </p>
            {/* Desktop Donate Button */}
            <div className="hidden lg:block">
              <Link 
                href="/donate" 
                className="group relative overflow-hidden bg-[#2da5cf] hover:bg-[#2092bc] text-white text-[15px] font-bold py-3.5 px-8 rounded-2xl tracking-wider uppercase transition-all duration-200 flex items-center justify-center"
              >
                <span className="relative overflow-hidden inline-flex justify-center items-center">
                  <span className="inline-block transition-all duration-500 ease-in-out transform group-hover:-translate-y-[150%] group-hover:rotate-[-10deg] origin-top-left">
                    Donate
                  </span>
                  <span className="absolute inline-block transition-all duration-500 ease-in-out transform translate-y-[150%] rotate-[10deg] origin-bottom-left group-hover:translate-y-0 group-hover:rotate-0 whitespace-nowrap">
                    Donate
                  </span>
                </span>
              </Link>
            </div>

            {/* Mobile Donate Button */}
            <div className="w-full lg:hidden mb-8">
              <Link 
                href="/donate" 
                className="group relative overflow-hidden block w-full text-center bg-[#2da5cf] hover:bg-[#2092bc] text-white text-[16px] font-bold py-4 rounded-2xl tracking-wider uppercase transition-all duration-200 flex items-center justify-center"
              >
                <span className="relative overflow-hidden inline-flex justify-center items-center">
                  <span className="inline-block transition-all duration-500 ease-in-out transform group-hover:-translate-y-[150%] group-hover:rotate-[-10deg] origin-top-left">
                    Donate
                  </span>
                  <span className="absolute inline-block transition-all duration-500 ease-in-out transform translate-y-[150%] rotate-[10deg] origin-bottom-left group-hover:translate-y-0 group-hover:rotate-0 whitespace-nowrap">
                    Donate
                  </span>
                </span>
              </Link>
            </div>
          </div>

          {/* Menu Column */}
          <div className="col-span-1 lg:col-span-4 lg:pl-8">
            <h4 className="font-extrabold text-lg mb-6 tracking-wide">Menu</h4>

            {/* Desktop Menu List */}
            <ul className="hidden lg:flex flex-col gap-4">
              {menuLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/90 hover:text-[#2da5cf] text-[15px] font-semibold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Menu Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 lg:hidden">
              {menuLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/90 hover:text-[#2da5cf] text-[15px] font-semibold transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Follow Us Column */}
          <div className="col-span-1 lg:col-span-3">
            <h4 className="font-extrabold text-lg mb-6 tracking-wide">Follow us</h4>

            {/* Desktop Social list */}
            <ul className="hidden lg:flex flex-col gap-4">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-[#2da5cf] text-[15px] font-semibold transition-colors duration-200 group"
                  >
                    <social.icon className="w-5 h-5 text-[#f4c015] stroke-[2] transition-colors duration-200" />
                    <span>{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile Social Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 lg:hidden">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/90 hover:text-[#2da5cf] text-[15px] font-semibold transition-colors duration-200"
                >
                  <social.icon className="w-5 h-5 text-[#f4c015] stroke-[2]" />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm font-medium">
            © {new Date().getFullYear()} — All rights reserved | Clean Technology Hub
          </p>
        </div>
      </div>
    </footer>
  );
}
