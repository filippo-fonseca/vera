"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Particles from "@/components/landing/Particles";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import LogoHeader from "@/components/common/LogoHeader/LogoHeader";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { School } from "@/lib/types";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSchool = async () => {
      if (user?.schoolId) {
        try {
          const schoolDoc = await getDoc(doc(db, "schools", user.schoolId));
          if (schoolDoc.exists()) {
            setSchool({
              id: schoolDoc.id,
              ...schoolDoc.data(),
              createdAt: schoolDoc.data().createdAt?.toDate(),
              updatedAt: schoolDoc.data().updatedAt?.toDate(),
            } as School);
          }
        } catch (error) {
          console.error("Error fetching school data:", error);
        }
      }
    };

    fetchSchool();
  }, [user?.schoolId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <Particles
          className="absolute inset-0"
          quantity={3000}
          ease={80}
          color={"#ec489920"}
          refresh
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-sm font-medium text-gray-400 z-10"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user || user.role !== "student") {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden relative">
      <Particles
        className="absolute inset-0 z-0"
        quantity={3000}
        ease={80}
        color={"#ec489915"}
        refresh
      />

      {/* Top Bar */}
      <div className="relative z-10">
        <LogoHeader
          showSchool={true}
          schoolName={school?.name}
          schoolLogoUrl={school?.logoUrl}
          onSignOut={signOut}
          className="bg-white/80 backdrop-blur-sm"
        />
        <div className="absolute top-7 right-6 flex items-center justify-center gap-6">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Bell
              size={20}
              className="stroke-gray-600 hover:stroke-pink-500 cursor-pointer transition-colors"
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="size-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer"
          >
            {user.firstName?.[0] || user.email?.[0]}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3 z-10">
        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
