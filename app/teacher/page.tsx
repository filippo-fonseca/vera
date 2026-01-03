"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  FileText,
  X,
  Sparkles,
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
import { TextField, Select, TextArea } from "@/components/common/Form";
import { getClassBanner, getClassIconName } from "@/lib/classCustomization";

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[
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
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />
              <div className="relative flex items-center gap-4">
                <div
                  className={`size-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="size-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
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
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Create Your First Class
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls, index) => {
              const IconComponent = {
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
              }[getClassIconName(cls.icon)];

              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => router.push(`/teacher/classes/${cls.id}`)}
                  className="group bg-white border-2 border-gray-100 rounded-2xl shadow-md hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                >
                  <div
                    className={`h-32 p-6 text-white relative overflow-hidden bg-gradient-to-r ${getClassBanner(cls.banner).gradient}`}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="relative z-10 h-full flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black mb-1 line-clamp-1">
                          {cls.name}
                        </h3>
                        <p className="text-white/90 font-semibold text-sm">
                          {cls.subject}
                        </p>
                      </div>
                      {IconComponent && (
                        <div className="size-14 rounded-xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="size-7 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    {cls.section && (
                      <p className="text-sm font-semibold text-gray-600 mb-3">
                        Section {cls.section}
                        {cls.room && ` • Room ${cls.room}`}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Users className="size-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold">
                        {cls.studentIds.length}{" "}
                        {cls.studentIds.length === 1 ? "student" : "students"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !creating && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-100"
            >
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
                <h2 className="text-2xl font-black text-gray-900">
                  Create New Class
                </h2>
                <button
                  onClick={() => !creating && setShowCreateModal(false)}
                  disabled={creating}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <TextField
                  label="Class Name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., AP Biology"
                  disabled={creating}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Subject"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="e.g., Biology"
                    disabled={creating}
                  />
                  <TextField
                    label="Section"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                    placeholder="e.g., A"
                    disabled={creating}
                  />
                </div>

                <TextField
                  label="Room"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  placeholder="e.g., 204"
                  disabled={creating}
                />

                <TextArea
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Brief description of the class..."
                  disabled={creating}
                />

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Class Color
                  </label>
                  <div className="flex gap-3">
                    {CLASS_COLORS.map((color) => (
                      <motion.button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          !creating &&
                          setFormData({ ...formData, color: color.value })
                        }
                        disabled={creating}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`size-12 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${
                          formData.color === color.value
                            ? "ring-4 ring-gray-900 ring-offset-2 scale-110"
                            : ""
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="size-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Creating...
                      </>
                    ) : (
                      "Create Class"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
