"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Calendar className="size-4" />
          </div>
          <input
            ref={ref}
            type="date"
            className={`w-full pl-11 pr-4 py-3.5 text-sm font-medium border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
            {...props}
          />
        </div>
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

DatePicker.displayName = "DatePicker";

export default DatePicker;
