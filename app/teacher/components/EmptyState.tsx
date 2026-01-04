"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white border-2 border-gray-100 rounded-2xl p-16 text-center shadow-lg"
    >
      <div className="relative inline-block mb-6">
        <BookOpen className="size-20 text-gray-300" />
        <Sparkles className="size-8 text-pink-500 absolute -top-2 -right-2 animate-pulse" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-3">
        No classes yet
      </h3>
      <p className="text-gray-600 font-medium mb-8 max-w-md mx-auto">
        Create your first class to get started with managing students and
        assignments
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateClick}
        className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
      >
        <Plus className="size-3.5" />
        Create Your First Class
      </motion.button>
    </motion.div>
  );
}
