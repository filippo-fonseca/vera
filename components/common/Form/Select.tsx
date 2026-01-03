"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full appearance-none pl-4 pr-10 py-3.5 text-sm font-medium border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="size-5 text-gray-400" />
          </div>
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

Select.displayName = "Select";

export default Select;
