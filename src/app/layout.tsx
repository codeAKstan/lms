import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | CTH EdTech",
    default: "CTH EdTech - LMS",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cth-lms.vercel.app"),
  description: "Empowering the future through Tech Education and Climate Innovation. Master clean tech skills today.",
  keywords: ["Clean Tech", "Solar Energy", "Sustainability", "LMS", "Education", "Nigeria", "Climate Change"],
  authors: [{ name: "CTH EdTech" }],
  icons: {
    icon: [
      { url: "/Logo.webp", type: "image/webp" },
    ],
    apple: [
      { url: "/Logo.webp", type: "image/webp" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cleantechnologyhub.com",
    siteName: "CTH EdTech LMS",
    title: "CTH EdTech - Future of Green Energy Education",
    description: "Join thousands of students mastering the skills for a sustainable future.",
    images: [
      {
        url: "/og-image.jpg", // We assume this exists or standard placeholder
        width: 1200,
        height: 630,
        alt: "CTH EdTech"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CTH EdTech - LMS",
    description: "Empowering the future through Tech Education and Climate Innovation.",
    creator: "@cleantechhub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
