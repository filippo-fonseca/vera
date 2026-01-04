"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  FileText,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Class } from "@/lib/types";
import { TeacherStats } from "./components/TeacherStats";
import { ClassCard } from "./components/ClassCard";
import { CreateClassModal } from "./components/CreateClassModal";
import { EmptyState } from "./components/EmptyState";

const CLASS_COLORS = [
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#a855f7" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
    section: "",
    room: "",
    color: CLASS_COLORS[0].value,
  });

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      const classesQuery = query(
        collection(db, "classes"),
        where("teacherId", "==", user.id),
        where("schoolId", "==", user.schoolId)
      );
      const snapshot = await getDocs(classesQuery);
      const classesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Class[];

      setClasses(classesData);

      // Calculate total unique students
      const studentSet = new Set<string>();
      classesData.forEach((cls) => {
        cls.studentIds.forEach((id) => studentSet.add(id));
      });
      setTotalStudents(studentSet.size);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);

    try {
      await addDoc(collection(db, "classes"), {
        name: formData.name,
        subject: formData.subject,
        description: formData.description,
        section: formData.section,
        room: formData.room,
        color: formData.color,
        schoolId: user.schoolId,
        teacherId: user.id,
        teacherName: `${user.firstName} ${user.lastName}`,
        studentIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setFormData({
        name: "",
        subject: "",
        description: "",
        section: "",
        room: "",
        color: CLASS_COLORS[0].value,
      });
      setShowCreateModal(false);
      await fetchClasses();
    } catch (error) {
      console.error("Error creating class:", error);
    } finally {
      setCreating(false);
    }
  };

  const stats = [
    {
      label: "My Classes",
      value: classes.length,
      icon: BookOpen,
      color: "pink",
      gradient: "from-pink-500 to-pink-600",
      delay: 0,
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      delay: 0.1,
    },
    {
      label: "This Week",
      value: 0,
      icon: Calendar,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      delay: 0.2,
    },
    {
      label: "Assignments",
      value: 0,
      icon: FileText,
      color: "green",
      gradient: "from-green-500 to-green-600",
      delay: 0.3,
    },
  ];

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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                My Classes
              </h1>
              <p className="text-gray-600 font-medium">
                Manage your classes, assignments, and students
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Create Class
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <TeacherStats stats={stats} />

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <EmptyState onCreateClick={() => setShowCreateModal(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls, index) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                index={index}
                onClick={() => router.push(`/teacher/classes/${cls.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreateClass}
        creating={creating}
      />
    </div>
  );
}
