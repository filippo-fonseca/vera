"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import LogoAppIcon from "@/components/icons/LogoAppIcon";
import CustomButton from "@/components/common/CustomButton/CustomButton";

interface LogoHeaderProps {
  showSchool?: boolean;
  schoolName?: string;
  schoolLogoUrl?: string;
  onSignOut?: () => void;
  className?: string;
}

export default function LogoHeader({
  showSchool = false,
  schoolName,
  schoolLogoUrl,
  onSignOut,
  className = "",
}: LogoHeaderProps) {
  const [hoverLogos, setHoverLogos] = useState(false);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white mt-3 mx-3 rounded-xl p-4 flex justify-between items-center border-gray-200 border shadow-md ${className}`}
    >
      <div
        className="flex items-center justify-left cursor-pointer gap-2 border p-2 rounded-md shadow-md"
        onMouseEnter={() => setHoverLogos(true)}
        onMouseLeave={() => setHoverLogos(false)}
      >
        <div className="flex items-center justify-center max-w-fit gap-1">
          <div className="flex items-center justify-center max-w-fit gap-1">
            <LogoAppIcon className="size-8" />
          </div>
          {hoverLogos && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-sm whitespace-nowrap"
            >
              Vera
            </motion.span>
          )}
        </div>
        {showSchool && schoolName && (
          <>
            <X className="size-3" />
            <div className="flex items-center">
              <div className="flex items-center justify-center max-w-fit gap-2">
                {schoolLogoUrl && (
                  <img
                    src={schoolLogoUrl}
                    className="size-[22px] rounded-full object-cover"
                    alt="School Logo"
                  />
                )}
                {hoverLogos && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-bold text-sm whitespace-nowrap"
                  >
                    {schoolName}
                  </motion.span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {onSignOut && (
        <div className="flex items-center justify-center gap-6">
          <CustomButton onClick={onSignOut} isInverse>
            Sign out
          </CustomButton>
        </div>
      )}
    </motion.div>
  );
}
