"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";

interface NavItem {
  label: string;
  href?: string;
  dropdownItems?: { label: string; href: string }[];
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    {
      label: "About us",
      dropdownItems: [
        { label: "Mission & Vision", href: "/about#mission" },
        { label: "Our Team", href: "/about#team" },
      ],
    },
    {
      label: "Our Work",
      dropdownItems: [
        { label: "Research & Policy", href: "/our-work/research-policy" },
        { label: "Enterprise Development", href: "/our-work/enterprise-development" },
        { label: "Environment & Climate Action", href: "/our-work/environment-climate-action" },
        { label: "Energy Access", href: "/our-work/energy-access" },
      ],
    },
    { label: "Stories", href: "/blog" },
    {
      label: "Resources",
      dropdownItems: [
        { label: "Publications", href: "/resources/publications" },
        { label: "Podcast", href: "/resources/podcast" },
        { label: "Events", href: "/resources/events" },
      ],
    },
    { label: "Get Involved", href: "/get-involved" },
    { label: "Contact", href: "/contact" },
  ];

  // Mobile flat menu items matching the requested screenshot (excluding Donate since it is rendered separately as a button)
  const mobileMenuItems = [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about" },
    { label: "Our team", href: "/about#team" },
    { label: "Research and Policy", href: "/our-work/research-policy" },
    { label: "Enterprise Development and Support", href: "/our-work/enterprise-development" },
    { label: "Environment and Climate Action", href: "/our-work/environment-climate-action" },
    { label: "Energy Access", href: "/our-work/energy-access" },
    { label: "Stories", href: "/blog" },
    { label: "Publications", href: "/resources/publications" },
    { label: "Podcast and Media", href: "/resources/podcast" },
    { label: "Events", href: "/resources/events" },
    { label: "Get Involved", href: "/get-involved" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white border-b border-gray-100 fixed top-0 w-full z-50">
      <div className="container mx-auto px-6 md:px-12 h-24 flex items-center justify-between">

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

        {/* Center/Right Nav Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => {
            const hasDropdown = !!item.dropdownItems;

            if (hasDropdown) {
              const isOpen = activeDropdown === item.label;
              return (
                <div
                  key={item.label}
                  className="relative py-8"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center text-[15px] font-semibold transition-colors duration-200 cursor-pointer ${isOpen ? "text-[#2da5cf]" : "text-[#0c3162] hover:text-[#2da5cf]"
                      }`}
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Panel */}
                  {isOpen && (
                    <div className="absolute top-[90px] left-0 bg-white border border-gray-100 rounded-xl shadow-xl p-6 min-w-[280px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-wrap gap-x-8 gap-y-3 max-w-[500px]">
                        {item.dropdownItems?.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="text-[14px] font-semibold text-[#0c3162] hover:text-[#2da5cf] transition-colors whitespace-nowrap py-1 pr-4"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href || "#"}
                className="text-[15px] font-semibold text-[#0c3162] hover:text-[#2da5cf] transition-colors py-8"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Donate Button */}
        <div className="hidden lg:flex items-center">
          <Link 
            href="/donate" 
            className="group relative overflow-hidden bg-[#2da5cf] hover:bg-[#2092bc] text-white text-[14px] font-bold py-3.5 px-8 rounded-2xl tracking-wider transition-all duration-200 uppercase flex items-center justify-center"
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

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-[#0c3162] focus:outline-none"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* Full Screen Mobile Overlay (with slow, smooth slide transition from left) */}
      <div
        className={`fixed inset-0 bg-[#051e44] z-[999] flex flex-col p-8 overflow-y-auto transition-transform duration-500 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header area with close button */}
        <div className="flex justify-end mb-4">
          <button
            className="p-2 text-white focus:outline-none"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-5 mt-4 pl-4 pb-12">
          {mobileMenuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[20px] font-medium text-white hover:text-[#2da5cf] transition-colors py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Specially styled Donate button exactly like screenshot */}
          <div className="mt-4 pr-4">
            <Link 
              href="/donate" 
              className="group relative overflow-hidden block w-full bg-[#f4c015] hover:bg-[#e2b010] text-[#051e44] font-bold text-center py-4 rounded-2xl transition-all duration-200 text-[18px] flex items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
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
        </nav>
      </div>
    </header>
  );
}
