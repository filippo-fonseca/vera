"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Users,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Class } from "@/lib/types";
import { getClassColor, getClassIconName } from "@/lib/classCustomization";

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      try {
        const classesQuery = query(
          collection(db, "classes"),
          where("studentIds", "array-contains", user.id)
        );
        const snapshot = await getDocs(classesQuery);
        const classesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Class[];

        setClasses(classesData);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
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
    return icons[iconName] || BookOpen;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-gray-200 border-t-pink-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black text-gray-900 mb-3">My Classes</h1>
          <p className="text-xl text-gray-600 font-medium">
            Welcome back, {user?.firstName}! You have {classes.length} {classes.length === 1 ? 'class' : 'classes'}.
          </p>
        </motion.div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center shadow-lg"
          >
            <BookOpen className="size-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No Classes Yet
            </h3>
            <p className="text-gray-600 font-medium">
              You haven't been enrolled in any classes yet.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem, index) => {
              const IconComponent = getIconComponent(getClassIconName(classItem.icon));
              const colorClass = getClassColor(classItem.color);

              return (
                <motion.div
                  key={classItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  onClick={() => router.push(`/student/classes/${classItem.id}`)}
                  className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-2xl transition-all overflow-hidden group cursor-pointer"
                >
                  {/* Color Header */}
                  <div className={`h-2 bg-gradient-to-r ${colorClass}`} />

                  <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`size-14 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="size-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-pink-600 transition-colors truncate">
                          {classItem.name}
                        </h3>
                        <p className="text-sm font-semibold text-gray-600 truncate">
                          {classItem.subject}
                        </p>
                      </div>
                    </div>

                    {/* Teacher */}
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <Users className="size-4 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {classItem.teacherName}
                      </span>
                    </div>

                    {/* Section/Room */}
                    {(classItem.section || classItem.room) && (
                      <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                        {classItem.section && (
                          <span className="px-2 py-1 bg-gray-100 rounded-lg">
                            Section {classItem.section}
                          </span>
                        )}
                        {classItem.room && (
                          <span className="px-2 py-1 bg-gray-100 rounded-lg">
                            Room {classItem.room}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-gray-50 border-t-2 border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                      <Users className="size-3.5" />
                      {classItem.studentIds.length} students
                    </div>
                    <div className="text-xs font-bold text-pink-600 group-hover:translate-x-1 transition-transform">
                      View Class →
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
