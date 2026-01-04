"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <div className="mx-3 mt-3 mb-2">
      <motion.button
        whileHover={{ x: -2 }}
        onClick={() => router.push("/teacher")}
        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-all text-xs font-semibold hover:bg-gray-100 px-2.5 py-1.5 rounded-lg"
      >
        <ArrowLeft className="size-3.5" />
        Back to Classes
      </motion.button>
    </div>
  );
}
