"use client";

import { motion } from "framer-motion";
import { Home, Users, FileText, FolderOpen, LucideIcon } from "lucide-react";

export type TabType = "stream" | "students" | "assignments" | "files";

interface Tab {
  id: TabType;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface ClassTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  studentsCount: number;
  assignmentsCount: number;
  filesCount: number;
}

export default function ClassTabs({
  activeTab,
  onTabChange,
  studentsCount,
  assignmentsCount,
  filesCount,
}: ClassTabsProps) {
  const tabs: Tab[] = [
    { id: "stream", label: "Stream", icon: Home },
    { id: "students", label: "Students", icon: Users, count: studentsCount },
    { id: "assignments", label: "Assignments", icon: FileText, count: assignmentsCount },
    { id: "files", label: "Files", icon: FolderOpen, count: filesCount },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b-2 border-gray-100 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-4 px-6 font-bold transition-all ${
                activeTab === tab.id
                  ? "text-pink-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="size-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? "bg-pink-100 text-pink-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-t-full"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
