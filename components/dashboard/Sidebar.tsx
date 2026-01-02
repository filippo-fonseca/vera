'use client';

import React, { useState } from "react";
import {
    University,
    User,
    FolderCog,
    Minimize,
    Minimize2,
    GraduationCap,
    LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItem {
    label: string;
    icon: JSX.Element;
    href: string;
}

export default function Sidebar() {
    const pathname = usePathname();
    const [isMinimized, setIsMinimized] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const items: SidebarItem[] = [
        {
            label: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            href: "/admin",
        },
        {
            label: "School",
            icon: <University size={20} />,
            href: "/admin/school",
        },
        {
            label: "Employees",
            icon: <User size={20} />,
            href: "/admin/employees",
        },
        {
            label: "Students",
            icon: <GraduationCap size={20} />,
            href: "/admin/students",
        },
    ];

    const toggleMinimized = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <motion.div
            animate={{
                width: isMinimized && !isHovered ? "75px" : "256px"
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative bg-white/80 backdrop-blur-sm rounded-xl text-black flex flex-col p-4 gap-4 border border-gray-200/50 shadow-lg h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`flex items-center ${
                    isMinimized && !isHovered ? "justify-center" : "justify-end"
                } w-full`}
            >
                <motion.button
                    onClick={toggleMinimized}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`z-20 size-7 flex items-center justify-center rounded-full shadow-md focus:outline-none transition-colors ${
                        isMinimized ? "bg-pink-500" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                    {!isMinimized ? (
                        <Minimize2 size={12} />
                    ) : (
                        <Minimize size={12} className="stroke-white" />
                    )}
                </motion.button>
            </div>
            <div className="w-full flex flex-col flex-wrap">
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={item.href}
                                className={`flex cursor-pointer items-center gap-x-3.5 py-2.5 px-3 text-sm rounded-lg transition-all group ${
                                    pathname === item.href
                                        ? "bg-pink-50 text-pink-600 font-semibold shadow-sm border border-pink-200/50"
                                        : "text-gray-700 hover:bg-gray-100/80 hover:text-pink-500"
                                }`}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    {item.icon}
                                </motion.div>
                                <AnimatePresence>
                                    {(isHovered || !isMinimized) && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}
