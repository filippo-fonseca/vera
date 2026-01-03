"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-3.5 text-sm font-medium border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed resize-none ${className}`}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs font-semibold text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
