import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={inter.variable}>
            <Header />
            <main className="min-h-screen pt-20">{children}</main>
            <Footer />
        </div>
    );
}
