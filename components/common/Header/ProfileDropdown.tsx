"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  LogOut,
  HelpCircle,
  Palette,
  Shield,
  ChevronDown,
} from "lucide-react";

interface ProfileDropdownProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  onSignOut: () => void;
}

export default function ProfileDropdown({
  user,
  onSignOut,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      onClick: () => {
        console.log("Profile clicked");
        setIsOpen(false);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        console.log("Settings clicked");
        setIsOpen(false);
      },
    },
    {
      icon: Palette,
      label: "Appearance",
      onClick: () => {
        console.log("Appearance clicked");
        setIsOpen(false);
      },
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => {
        console.log("Help clicked");
        setIsOpen(false);
      },
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "from-pink-500 to-pink-600";
      case "teacher":
        return "from-purple-500 to-purple-600";
      case "student":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-pink-100 text-pink-700";
      case "teacher":
        return "bg-purple-100 text-purple-700";
      case "student":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative z-[300]" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-xl px-2 py-1.5 transition-colors group"
      >
        <div
          className={`size-9 rounded-xl bg-gradient-to-br ${getRoleColor(
            user.role
          )} flex items-center justify-center shadow-md`}
        >
          <span className="text-white font-black text-sm">
            {user.firstName[0]}
            {user.lastName[0]}
          </span>
        </div>
        <ChevronDown
          className={`size-4 text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-[9999]"
          >
            {/* User Info */}
            <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`size-12 rounded-xl bg-gradient-to-br ${getRoleColor(
                    user.role
                  )} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white font-black text-lg">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs font-medium text-gray-600">
                    {user.email}
                  </p>
                </div>
              </div>
              <span
                className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  whileHover={{ x: 4 }}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="size-8 rounded-lg bg-gray-100 group-hover:bg-pink-100 flex items-center justify-center transition-colors">
                    <item.icon className="size-4 text-gray-600 group-hover:text-pink-600 transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t-2 border-gray-100 bg-gray-50">
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors group"
              >
                <div className="size-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                  <LogOut className="size-4 text-red-600" />
                </div>
                <span className="text-sm font-bold text-red-600 group-hover:text-red-700">
                  Sign Out
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
