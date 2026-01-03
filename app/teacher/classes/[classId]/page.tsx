"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  FileText,
  Plus,
  X,
  Search,
  Trash2,
  Edit,
  Calendar,
  UserPlus,
  Loader2,
  Home,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Class, Assignment, Student } from "@/lib/types";
import { TextField, Select, DatePicker, TextArea } from "@/components/common/Form";
import Particles from "@/components/landing/Particles";

type TabType = "stream" | "students" | "assignments";

export default function ClassDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [removingStudent, setRemovingStudent] = useState<string | null>(null);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);

  // Assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    points: "",
    type: "assignment" as Assignment["type"],
  });
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (user) {
      fetchClassData();
      fetchAssignments();
    }
  }, [user, classId]);

  useEffect(() => {
    if (classData) {
      fetchStudents();
    }
  }, [classData]);

  const fetchClassData = async () => {
    try {
      const classDoc = await getDoc(doc(db, "classes", classId));
      if (classDoc.exists()) {
        setClassData({
          id: classDoc.id,
          ...classDoc.data(),
          createdAt: classDoc.data().createdAt?.toDate(),
          updatedAt: classDoc.data().updatedAt?.toDate(),
        } as Class);
      }
    } catch (error) {
      console.error("Error fetching class:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!classData || classData.studentIds.length === 0) {
      setStudents([]);
      return;
    }

    setFetchingStudents(true);
    try {
      const studentsData: Student[] = [];
      for (const studentId of classData.studentIds) {
        const studentDoc = await getDoc(doc(db, "users", studentId));
        if (studentDoc.exists()) {
          studentsData.push({
            id: studentDoc.id,
            ...studentDoc.data(),
            createdAt: studentDoc.data().createdAt?.toDate(),
            updatedAt: studentDoc.data().updatedAt?.toDate(),
          } as Student);
        }
      }
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setFetchingStudents(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const assignmentsQuery = query(
        collection(db, "assignments"),
        where("classId", "==", classId)
      );
      const snapshot = await getDocs(assignmentsQuery);
      const assignmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Assignment[];

      setAssignments(
        assignmentsData.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        })
      );
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const searchAvailableStudents = async () => {
    if (!user || !searchQuery.trim()) {
      setAvailableStudents([]);
      return;
    }

    setSearchingStudents(true);
    try {
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("schoolId", "==", user.schoolId)
      );
      const snapshot = await getDocs(studentsQuery);
      const allStudents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Student[];

      const filtered = allStudents.filter((student) => {
        const alreadyEnrolled = classData?.studentIds.includes(student.id);
        const matchesSearch =
          student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase());
        return !alreadyEnrolled && matchesSearch;
      });

      setAvailableStudents(filtered);
    } catch (error) {
      console.error("Error searching students:", error);
    } finally {
      setSearchingStudents(false);
    }
  };

  useEffect(() => {
    if (showAddStudentModal) {
      searchAvailableStudents();
    }
  }, [searchQuery, showAddStudentModal]);

  const handleAddStudent = async (studentId: string) => {
    setAddingStudent(true);
    try {
      await updateDoc(doc(db, "classes", classId), {
        studentIds: arrayUnion(studentId),
        updatedAt: new Date(),
      });
      await fetchClassData();
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding student:", error);
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    setRemovingStudent(studentId);
    try {
      await updateDoc(doc(db, "classes", classId), {
        studentIds: arrayRemove(studentId),
        updatedAt: new Date(),
      });
      await fetchClassData();
    } catch (error) {
      console.error("Error removing student:", error);
    } finally {
      setRemovingStudent(null);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreatingAssignment(true);
    try {
      const assignmentData: any = {
        classId,
        title: assignmentForm.title,
        description: assignmentForm.description,
        type: assignmentForm.type,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (assignmentForm.dueDate) {
        assignmentData.dueDate = new Date(assignmentForm.dueDate);
      }
      if (assignmentForm.points) {
        assignmentData.points = parseInt(assignmentForm.points);
      }

      await addDoc(collection(db, "assignments"), assignmentData);

      setAssignmentForm({
        title: "",
        description: "",
        dueDate: "",
        points: "",
        type: "assignment",
      });
      setShowCreateAssignmentModal(false);
      await fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleEditAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    setEditingAssignmentId(editingAssignment.id);
    try {
      const updateData: any = {
        title: assignmentForm.title,
        description: assignmentForm.description,
        type: assignmentForm.type,
        updatedAt: new Date(),
      };

      if (assignmentForm.dueDate) {
        updateData.dueDate = new Date(assignmentForm.dueDate);
      }
      if (assignmentForm.points) {
        updateData.points = parseInt(assignmentForm.points);
      }

      await updateDoc(doc(db, "assignments", editingAssignment.id), updateData);

      setAssignmentForm({
        title: "",
        description: "",
        dueDate: "",
        points: "",
        type: "assignment",
      });
      setEditingAssignment(null);
      setShowEditAssignmentModal(false);
      await fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment:", error);
    } finally {
      setEditingAssignmentId(null);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    setDeletingAssignment(assignmentId);
    try {
      await deleteDoc(doc(db, "assignments", assignmentId));
      await fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
    } finally {
      setDeletingAssignment(null);
    }
  };

  const openEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description || "",
      dueDate: assignment.dueDate
        ? assignment.dueDate.toISOString().split("T")[0]
        : "",
      points: assignment.points?.toString() || "",
      type: assignment.type,
    });
    setShowEditAssignmentModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-gray-200 border-t-pink-500"
        />
        <p className="text-sm font-semibold text-gray-600">Loading class...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Class not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <Particles
        className="absolute inset-0 opacity-20"
        quantity={80}
        ease={80}
        color={"#ec489920"}
        refresh
      />

      {/* Header */}
      <div
        className="relative p-8 text-white shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${classData.color} 0%, ${classData.color}dd 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.push("/teacher")}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-all font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <ArrowLeft className="size-5" />
            Back to Classes
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-black mb-3 tracking-tight drop-shadow-lg">
              {classData.name}
            </h1>
            <p className="text-white/95 text-xl font-semibold">
              {classData.subject}
            </p>
            {classData.section && (
              <p className="text-white/80 font-medium text-sm mt-2">
                Section {classData.section}
                {classData.room && ` • Room ${classData.room}`}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b-2 border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            {[
              { id: "stream", label: "Stream", icon: Home },
              { id: "students", label: "Students", icon: Users, count: students.length },
              { id: "assignments", label: "Assignments", icon: FileText, count: assignments.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative py-4 px-6 font-bold transition-all ${
                  activeTab === tab.id
                    ? "text-pink-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="size-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? "bg-pink-100 text-pink-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-t-full"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "stream" && (
            <motion.div
              key="stream"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center shadow-lg">
                <Home className="size-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  Class Stream
                </h2>
                <p className="text-gray-600 font-medium">
                  Upcoming announcements and updates will appear here
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "students" && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">
                  Students ({students.length})
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all flex items-center gap-2"
                >
                  <UserPlus className="size-4" />
                  Add Students
                </motion.button>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg">
                {fetchingStudents ? (
                  <div className="p-12 text-center">
                    <Loader2 className="size-8 text-pink-500 mx-auto mb-3 animate-spin" />
                    <p className="text-gray-600 font-medium">Loading students...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="size-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      No students enrolled
                    </h3>
                    <p className="text-gray-600 font-medium mb-6">
                      Add students to this class to get started
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddStudentModal(true)}
                      className="px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all inline-flex items-center gap-2"
                    >
                      <UserPlus className="size-4" />
                      Add Students
                    </motion.button>
                  </div>
                ) : (
                  <div className="divide-y-2 divide-gray-100">
                    {students.map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-black text-lg">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm font-medium text-gray-600">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveStudent(student.id)}
                          disabled={removingStudent === student.id}
                          className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group/btn disabled:opacity-50"
                        >
                          {removingStudent === student.id ? (
                            <Loader2 className="size-4 text-red-500 animate-spin" />
                          ) : (
                            <Trash2 className="size-4 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "assignments" && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">
                  Assignments ({assignments.length})
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateAssignmentModal(true)}
                  className="px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  Create Assignment
                </motion.button>
              </div>

              {assignments.length === 0 ? (
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center shadow-lg">
                  <FileText className="size-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    No assignments yet
                  </h3>
                  <p className="text-gray-600 font-medium mb-6">
                    Create your first assignment for this class
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateAssignmentModal(true)}
                    className="px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    Create Assignment
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-black text-gray-900">
                              {assignment.title}
                            </h3>
                            <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-bold rounded-lg uppercase tracking-wide">
                              {assignment.type}
                            </span>
                          </div>
                          {assignment.description && (
                            <p className="text-gray-600 font-medium mb-4">
                              {assignment.description}
                            </p>
                          )}
                          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
                            {assignment.dueDate && (
                              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                                <Calendar className="size-4 text-purple-600" />
                                <span className="text-purple-700">
                                  Due {assignment.dueDate.toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {assignment.points && (
                              <div className="bg-green-50 px-3 py-1.5 rounded-lg text-green-700">
                                {assignment.points} points
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditAssignment(assignment)}
                            className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors group/btn"
                          >
                            <Edit className="size-4 text-gray-400 group-hover/btn:text-blue-600 transition-colors" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            disabled={deletingAssignment === assignment.id}
                            className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group/btn disabled:opacity-50"
                          >
                            {deletingAssignment === assignment.id ? (
                              <Loader2 className="size-4 text-red-500 animate-spin" />
                            ) : (
                              <Trash2 className="size-4 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddStudentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !addingStudent && setShowAddStudentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-gray-100 flex flex-col"
            >
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-2xl font-black text-gray-900">Add Students</h2>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  disabled={addingStudent}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 border-b-2 border-gray-100">
                <TextField
                  icon={<Search className="size-4" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name or email..."
                  disabled={addingStudent}
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-12">
                    <Search className="size-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">
                      Search for students to add to this class
                    </p>
                  </div>
                ) : searchingStudents ? (
                  <div className="text-center py-12">
                    <Loader2 className="size-12 text-pink-500 mx-auto mb-3 animate-spin" />
                    <p className="text-gray-600 font-medium">Searching...</p>
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="size-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No students found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableStudents.map((student) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-pink-300 hover:bg-pink-50/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-black">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm font-medium text-gray-600">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddStudent(student.id)}
                          disabled={addingStudent}
                          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                        >
                          Add
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {showCreateAssignmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !creatingAssignment && setShowCreateAssignmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-100"
            >
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
                <h2 className="text-2xl font-black text-gray-900">
                  Create Assignment
                </h2>
                <button
                  onClick={() => setShowCreateAssignmentModal(false)}
                  disabled={creatingAssignment}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <TextField
                  label="Title"
                  required
                  value={assignmentForm.title}
                  onChange={(e) =>
                    setAssignmentForm({ ...assignmentForm, title: e.target.value })
                  }
                  placeholder="Assignment title"
                  disabled={creatingAssignment}
                />

                <Select
                  label="Type"
                  value={assignmentForm.type}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      type: e.target.value as Assignment["type"],
                    })
                  }
                  options={[
                    { value: "assignment", label: "Assignment" },
                    { value: "quiz", label: "Quiz" },
                    { value: "exam", label: "Exam" },
                    { value: "project", label: "Project" },
                  ]}
                  disabled={creatingAssignment}
                />

                <TextArea
                  label="Description"
                  value={assignmentForm.description}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Assignment instructions..."
                  disabled={creatingAssignment}
                />

                <div className="grid grid-cols-2 gap-4">
                  <DatePicker
                    label="Due Date"
                    value={assignmentForm.dueDate}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        dueDate: e.target.value,
                      })
                    }
                    disabled={creatingAssignment}
                  />
                  <TextField
                    label="Points"
                    type="number"
                    value={assignmentForm.points}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        points: e.target.value,
                      })
                    }
                    placeholder="100"
                    disabled={creatingAssignment}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateAssignmentModal(false)}
                    disabled={creatingAssignment}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAssignment}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creatingAssignment ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="size-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Creating...
                      </>
                    ) : (
                      "Create Assignment"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Assignment Modal */}
      <AnimatePresence>
        {showEditAssignmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !editingAssignmentId && setShowEditAssignmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-100"
            >
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-2xl font-black text-gray-900">
                  Edit Assignment
                </h2>
                <button
                  onClick={() => setShowEditAssignmentModal(false)}
                  disabled={!!editingAssignmentId}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleEditAssignment} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <TextField
                  label="Title"
                  required
                  value={assignmentForm.title}
                  onChange={(e) =>
                    setAssignmentForm({ ...assignmentForm, title: e.target.value })
                  }
                  placeholder="Assignment title"
                  disabled={!!editingAssignmentId}
                />

                <Select
                  label="Type"
                  value={assignmentForm.type}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      type: e.target.value as Assignment["type"],
                    })
                  }
                  options={[
                    { value: "assignment", label: "Assignment" },
                    { value: "quiz", label: "Quiz" },
                    { value: "exam", label: "Exam" },
                    { value: "project", label: "Project" },
                  ]}
                  disabled={!!editingAssignmentId}
                />

                <TextArea
                  label="Description"
                  value={assignmentForm.description}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Assignment instructions..."
                  disabled={!!editingAssignmentId}
                />

                <div className="grid grid-cols-2 gap-4">
                  <DatePicker
                    label="Due Date"
                    value={assignmentForm.dueDate}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        dueDate: e.target.value,
                      })
                    }
                    disabled={!!editingAssignmentId}
                  />
                  <TextField
                    label="Points"
                    type="number"
                    value={assignmentForm.points}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        points: e.target.value,
                      })
                    }
                    placeholder="100"
                    disabled={!!editingAssignmentId}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditAssignmentModal(false)}
                    disabled={!!editingAssignmentId}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!editingAssignmentId}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {editingAssignmentId ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="size-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
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
