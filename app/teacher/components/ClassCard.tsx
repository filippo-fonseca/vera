"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Class } from "@/lib/types";
import { getClassBanner, getClassIconName } from "@/lib/classCustomization";
import {
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

interface ClassCardProps {
  cls: Class;
  index: number;
  onClick: () => void;
}

const iconMap = {
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
};

export function ClassCard({ cls, index, onClick }: ClassCardProps) {
  const IconComponent = iconMap[getClassIconName(cls.icon) as keyof typeof iconMap];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group bg-white border-2 border-gray-100 rounded-2xl shadow-md hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
    >
      <div
        className={`h-32 p-6 text-white relative overflow-hidden bg-gradient-to-r ${getClassBanner(cls.banner).gradient}`}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="relative z-10 h-full flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-black mb-1 line-clamp-1">
              {cls.name}
            </h3>
            <p className="text-white/90 font-semibold text-sm">
              {cls.subject}
            </p>
          </div>
          {IconComponent && (
            <div className="size-14 rounded-xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-lg flex items-center justify-center flex-shrink-0">
              <IconComponent className="size-7 text-white" />
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {cls.section && (
          <p className="text-sm font-semibold text-gray-600 mb-3">
            Section {cls.section}
            {cls.room && ` • Room ${cls.room}`}
          </p>
        )}
        <div className="flex items-center gap-2 text-gray-700">
          <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="size-4 text-blue-600" />
          </div>
          <span className="text-sm font-bold">
            {cls.studentIds.length}{" "}
            {cls.studentIds.length === 1 ? "student" : "students"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
