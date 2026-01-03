"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import LogoAppIcon from "@/components/icons/LogoAppIcon";
import NotificationsDropdown from "./NotificationsDropdown";
import ProfileDropdown from "./ProfileDropdown";

interface AppHeaderProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  showSchool?: boolean;
  schoolName?: string;
  schoolLogoUrl?: string;
  onSignOut: () => void;
  className?: string;
}

export default function AppHeader({
  user,
  showSchool = false,
  schoolName,
  schoolLogoUrl,
  onSignOut,
  className = "",
}: AppHeaderProps) {
  const [hoverLogos, setHoverLogos] = useState(false);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/90 backdrop-blur-lg mt-3 mx-3 rounded-2xl px-5 py-3 flex justify-between items-center border-2 border-gray-100 shadow-lg overflow-visible ${className}`}
    >
      {/* Left: Logo and School */}
      <div
        className="flex items-center gap-2.5 px-3 py-2 border-2 border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
        onMouseEnter={() => setHoverLogos(true)}
        onMouseLeave={() => setHoverLogos(false)}
      >
        {/* Vera Logo */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-md">
            <LogoAppIcon className="size-5" />
          </div>
          <motion.span
            initial={false}
            animate={{
              width: hoverLogos ? "auto" : 0,
              opacity: hoverLogos ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="font-black text-sm whitespace-nowrap overflow-hidden"
          >
            Vera
          </motion.span>
        </div>

        {/* School Info */}
        {showSchool && schoolName && (
          <>
            <X className="size-3.5 text-gray-400" />
            <div className="flex items-center gap-2">
              {schoolLogoUrl && (
                <img
                  src={schoolLogoUrl}
                  className="size-7 rounded-lg object-cover border border-gray-200"
                  alt="School Logo"
                />
              )}
              <motion.span
                initial={false}
                animate={{
                  width: hoverLogos ? "auto" : 0,
                  opacity: hoverLogos ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="font-black text-sm whitespace-nowrap overflow-hidden"
              >
                {schoolName}
              </motion.span>
            </div>
          </>
        )}
      </div>

      {/* Right: Notifications and Profile */}
      <div className="flex items-center gap-2 relative z-[200]">
        <NotificationsDropdown />
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <ProfileDropdown user={user} onSignOut={onSignOut} />
      </div>
    </motion.div>
  );
}
