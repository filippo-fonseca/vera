"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Loader2,
  MoreVertical,
  BookOpen,
  Calculator,
  Beaker,
  Atom,
  Palette,
  Music,
  Globe,
  Code,
  Cpu,
  Dumbbell,
  Heart,
  Star,
} from "lucide-react";
import { Class } from "@/lib/types";
import { getClassBanner, getClassIconName } from "@/lib/classCustomization";

interface ClassHeaderProps {
  classData: Class;
  onEditClass: () => void;
  onDeleteClass: () => void;
  deletingClass: boolean;
  isReadOnly?: boolean;
}

export default function ClassHeader({
  classData,
  onEditClass,
  onDeleteClass,
  deletingClass,
  isReadOnly = false,
}: ClassHeaderProps) {
  const [showClassMenu, setShowClassMenu] = useState(false);
  const classMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (classMenuRef.current && !classMenuRef.current.contains(event.target as Node)) {
        setShowClassMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative p-8 text-white shadow-xl bg-gradient-to-r ${getClassBanner(classData.banner).gradient} mx-3 rounded-2xl overflow-hidden`}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-4"
          >
            {(() => {
              const IconComponent = {
                BookOpen,
                Calculator,
                Beaker,
                Atom,
                Palette,
                Music,
                Globe,
                Code,
                Cpu,
                Dumbbell,
                Heart,
                Star,
              }[getClassIconName(classData.icon)];

              return IconComponent ? (
                <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-2xl flex items-center justify-center flex-shrink-0">
                  <IconComponent className="size-9 text-white" />
                </div>
              ) : null;
            })()}
            <div>
              <h1 className="text-5xl font-black mb-3 tracking-tight drop-shadow-lg">
                {classData.name}
              </h1>
              <p className="text-white/95 text-xl font-semibold">
                {classData.subject}
              </p>
              {classData.section && (
                <p className="text-white/80 font-medium text-sm mt-2">
                  Section {classData.section}
                  {classData.room && ` • Room ${classData.room}`}
                </p>
              )}
            </div>
          </motion.div>
          {!isReadOnly && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
              ref={classMenuRef}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowClassMenu(!showClassMenu)}
                className="size-9 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/20 shadow-sm transition-all flex items-center justify-center cursor-pointer"
              >
                <MoreVertical className="size-4" />
              </motion.button>

              {showClassMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      onEditClass();
                      setShowClassMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                  >
                    <Edit className="size-4 text-blue-600" />
                    <span className="text-sm font-bold text-gray-700">
                      Edit Class
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setShowClassMenu(false);
                      onDeleteClass();
                    }}
                    disabled={deletingClass}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left disabled:opacity-50 cursor-pointer"
                  >
                    {deletingClass ? (
                      <>
                        <Loader2 className="size-4 text-red-600 animate-spin" />
                        <span className="text-sm font-bold text-red-600">
                          Deleting...
                        </span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-4 text-red-600" />
                        <span className="text-sm font-bold text-red-600">
                          Delete Class
                        </span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
