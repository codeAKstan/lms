import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

export default function LearnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${inter.variable} h-screen flex flex-col bg-surface`}>
            {children}
        </div>
    );
}
