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
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Class, User } from "@/lib/types";

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
      fetchClasses();
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classes</h1>
          <p className="text-gray-600">
            Manage your classes, assignments, and students
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus className="size-5" />
          Create Class
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-pink-100 flex items-center justify-center">
              <BookOpen className="size-6 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">My Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="size-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Calendar className="size-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FileText className="size-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 text-center"
        >
          <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No classes yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first class to get started with managing students and
            assignments
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Plus className="size-5" />
            Create Your First Class
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => router.push(`/teacher/classes/${cls.id}`)}
              className="bg-white border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
            >
              <div
                className="h-24 p-6 text-white relative overflow-hidden"
                style={{ backgroundColor: cls.color }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">{cls.name}</h3>
                  <p className="text-white/90 text-sm">{cls.subject}</p>
                </div>
              </div>
              <div className="p-6">
                {cls.section && (
                  <p className="text-sm text-gray-600 mb-2">
                    Section {cls.section}
                    {cls.room && ` • Room ${cls.room}`}
                  </p>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="size-4" />
                  <span className="text-sm">
                    {cls.studentIds.length}{" "}
                    {cls.studentIds.length === 1 ? "student" : "students"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Class
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="size-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    placeholder="e.g., AP Biology"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="e.g., Biology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Section
                    </label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="e.g., A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    placeholder="e.g., 204"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                    placeholder="Brief description of the class..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Class Color
                  </label>
                  <div className="flex gap-3">
                    {CLASS_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                        className={`size-10 rounded-lg transition-all ${
                          formData.color === color.value
                            ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                            : "hover:scale-110"
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
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Create Class
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
