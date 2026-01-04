"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
} from "lucide-react";
import { User as UserType } from "@/lib/types";
import UserProfileModal from "./UserProfileModal";

interface AppHeaderProps {
  user: UserType;
  showSchool?: boolean;
  schoolName?: string;
  schoolLogoUrl?: string;
  onSignOut: () => void;
}

export function AppHeader({
  user,
  showSchool = false,
  schoolName,
  schoolLogoUrl,
  onSignOut,
}: AppHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case "admin":
        return "Administrator";
      case "teacher":
        return "Teacher";
      case "student":
        return "Student";
      default:
        return user.role;
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-md border-b-2 border-gray-100 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Vera x School branding */}
            <div className="flex items-center gap-4">
              {showSchool && schoolName ? (
                <div className="flex items-center gap-4 group">
                  {/* Vera Logo */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div className="size-11 rounded-xl bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-lg transition-all group-hover:shadow-xl">
                      <span className="text-white font-black text-lg">V</span>
                    </div>
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <p className="text-sm font-black text-gray-900 whitespace-nowrap">Vera</p>
                      <p className="text-xs font-semibold text-gray-500 whitespace-nowrap">Education</p>
                    </motion.div>
                  </motion.div>

                  {/* Collaboration indicator */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                    className="relative"
                  >
                    <div className="size-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-md group-hover:shadow-lg transition-shadow">
                      <motion.span
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="text-gray-600 font-black text-sm"
                      >
                        ×
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* School Logo */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {schoolLogoUrl ? (
                      <img
                        src={schoolLogoUrl}
                        alt={schoolName}
                        className="size-11 rounded-xl object-cover shadow-lg border-2 border-white transition-all group-hover:shadow-xl"
                      />
                    ) : (
                      <div className="size-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg border-2 border-white transition-all group-hover:shadow-xl">
                        <Building2 className="size-5 text-white" />
                      </div>
                    )}
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <p className="text-sm font-black text-gray-900 whitespace-nowrap">{schoolName}</p>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {getRoleLabel()}
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              ) : (
                /* Standalone Vera logo when no school */
                <div className="group">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div className="size-11 rounded-xl bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-lg transition-all group-hover:shadow-xl">
                      <span className="text-white font-black text-lg">V</span>
                    </div>
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <p className="text-sm font-black text-gray-900 whitespace-nowrap">Vera</p>
                      <p className="text-xs font-semibold text-gray-500 whitespace-nowrap">Education</p>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Right side - User menu */}
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="size-9 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="size-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border-2 border-gray-200">
                    <span className="text-white font-black text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-black text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    {getRoleLabel()}
                  </p>
                </div>
                <ChevronDown
                  className={`size-4 text-gray-400 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50"
                  >
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-gray-100">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="size-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="size-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md">
                            <span className="text-white font-black text-base">
                              {getUserInitials()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs font-semibold text-gray-600 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {user.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {user.description}
                        </p>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                      >
                        <User className="size-4 text-blue-600" />
                        <span className="text-sm font-bold text-gray-700">
                          Edit Profile
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Add settings functionality
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Settings className="size-4 text-gray-600" />
                        <span className="text-sm font-bold text-gray-700">
                          Settings
                        </span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t-2 border-gray-100">
                      <button
                        onClick={() => {
                          onSignOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="size-4 text-red-600" />
                        <span className="text-sm font-bold text-red-600">
                          Sign Out
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}
