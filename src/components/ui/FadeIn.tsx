"use client";

import { motion } from "framer-motion";

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export default function FadeIn({
    children,
    delay = 0,
    className = "",
    direction = "up"
}: FadeInProps) {
    const variants = {
        hidden: {
            opacity: 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                delay: delay
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
}
