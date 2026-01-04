"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  gradient: string;
  delay: number;
}

interface TeacherStatsProps {
  stats: StatItem[];
}

export function TeacherStats({ stats }: TeacherStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: stat.delay }}
          className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
          />
          <div className="relative flex items-center gap-4">
            <div
              className={`size-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
            >
              <stat.icon className="size-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
