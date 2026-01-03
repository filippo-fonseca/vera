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
  MoreVertical,
  UserPlus,
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

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
    useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  // Assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    points: "",
    type: "assignment" as Assignment["type"],
  });
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );

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

      setAssignments(assignmentsData.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      }));
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const searchAvailableStudents = async () => {
    if (!user || !searchQuery.trim()) {
      setAvailableStudents([]);
      return;
    }

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

      // Filter out already enrolled students and search by name/email
      const filtered = allStudents.filter((student) => {
        const alreadyEnrolled = classData?.studentIds.includes(student.id);
        const matchesSearch =
          student.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase());
        return !alreadyEnrolled && matchesSearch;
      });

      setAvailableStudents(filtered);
    } catch (error) {
      console.error("Error searching students:", error);
    }
  };

  useEffect(() => {
    if (showAddStudentModal) {
      searchAvailableStudents();
    }
  }, [searchQuery, showAddStudentModal]);

  const handleAddStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, "classes", classId), {
        studentIds: arrayUnion(studentId),
        updatedAt: new Date(),
      });
      await fetchClassData();
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the class?"))
      return;

    try {
      await updateDoc(doc(db, "classes", classId), {
        studentIds: arrayRemove(studentId),
        updatedAt: new Date(),
      });
      await fetchClassData();
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
      fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  const handleEditAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

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
      fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await deleteDoc(doc(db, "assignments", assignmentId));
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="p-8 text-white relative"
        style={{ backgroundColor: classData.color }}
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push("/teacher")}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="size-5" />
            Back to Classes
          </button>
          <div>
            <h1 className="text-4xl font-bold mb-2">{classData.name}</h1>
            <p className="text-white/90 text-lg">{classData.subject}</p>
            {classData.section && (
              <p className="text-white/80 text-sm mt-1">
                Section {classData.section}
                {classData.room && ` • Room ${classData.room}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("stream")}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === "stream"
                  ? "border-pink-500 text-pink-500"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Stream
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "students"
                  ? "border-pink-500 text-pink-500"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="size-4" />
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "assignments"
                  ? "border-pink-500 text-pink-500"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="size-4" />
              Assignments ({assignments.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {activeTab === "stream" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Class Stream
              </h2>
              <p className="text-gray-600">
                Upcoming announcements and updates will appear here
              </p>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Students ({students.length})
              </h2>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <UserPlus className="size-4" />
                Add Students
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {students.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="size-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No students enrolled
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add students to this class to get started
                  </p>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    <UserPlus className="size-4" />
                    Add Students
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <Trash2 className="size-4 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Assignments ({assignments.length})
              </h2>
              <button
                onClick={() => setShowCreateAssignmentModal(true)}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Plus className="size-4" />
                Create Assignment
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <FileText className="size-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No assignments yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first assignment for this class
                </p>
                <button
                  onClick={() => setShowCreateAssignmentModal(true)}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  Create Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {assignment.title}
                          </h3>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                            {assignment.type}
                          </span>
                        </div>
                        {assignment.description && (
                          <p className="text-gray-600 mb-3">
                            {assignment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {assignment.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="size-4" />
                              Due {assignment.dueDate.toLocaleDateString()}
                            </div>
                          )}
                          {assignment.points && (
                            <span>{assignment.points} points</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditAssignment(assignment)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="size-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <Trash2 className="size-4 text-gray-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddStudentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddStudentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Students
                </h2>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="size-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students by name or email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-12">
                    <Search className="size-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Search for students to add to this class
                    </p>
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="size-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No students found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-pink-500 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddStudent(student.id)}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          Add
                        </button>
                      </div>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateAssignmentModal(false)}
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
                  Create Assignment
                </h2>
                <button
                  onClick={() => setShowCreateAssignmentModal(false)}
                  className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="size-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={assignmentForm.title}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    placeholder="Assignment title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={assignmentForm.type}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        type: e.target.value as Assignment["type"],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                    placeholder="Assignment instructions..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          dueDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.points}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          points: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateAssignmentModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Create Assignment
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditAssignmentModal(false)}
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
                  Edit Assignment
                </h2>
                <button
                  onClick={() => setShowEditAssignmentModal(false)}
                  className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="size-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEditAssignment} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={assignmentForm.title}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    placeholder="Assignment title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={assignmentForm.type}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        type: e.target.value as Assignment["type"],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                    placeholder="Assignment instructions..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          dueDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      value={assignmentForm.points}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          points: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditAssignmentModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Save Changes
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
