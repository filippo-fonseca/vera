"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Particles from "@/components/landing/Particles";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/common/Header";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { School } from "@/lib/types";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center relative overflow-hidden">
        <Particles
          className="absolute inset-0 opacity-30"
          quantity={100}
          ease={80}
          color={"#ec489920"}
          refresh
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-gray-200 border-t-pink-500"
          />
          <p className="text-sm font-semibold text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || user.role !== "teacher") {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col overflow-hidden relative">
      {/* Particles Background - Fixed */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          className="absolute inset-0 opacity-30"
          quantity={100}
          ease={80}
          color={"#ec489920"}
          refresh
        />
      </div>

      {/* Header */}
      <div className="relative z-[100]">
        <AppHeader
          user={user}
          showSchool={true}
          schoolName={school?.name}
          schoolLogoUrl={school?.logoUrl}
          onSignOut={signOut}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden p-3 relative z-10">
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
