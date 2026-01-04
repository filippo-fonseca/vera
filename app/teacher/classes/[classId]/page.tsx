"use client";

import { useState, useEffect, useRef } from "react";
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
  Check,
  MoreVertical,
  FolderOpen,
  Upload,
  FolderPlus,
  ChevronRight,
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
import { Class, Assignment, Student, Post, FileAttachment } from "@/lib/types";
import { TextField, Select, DatePicker, TextArea } from "@/components/common/Form";
import StreamPost from "@/components/classroom/StreamPost";
import { CLASS_ICONS, CLASS_COLORS, CLASS_BANNERS, getClassColor, getClassBanner, getClassIconName } from "@/lib/classCustomization";
import FileUpload from "@/components/files/FileUpload";
import FileCard from "@/components/files/FileCard";
import { uploadMultipleFiles } from "@/lib/storage";

type TabType = "stream" | "students" | "assignments" | "files";

export default function ClassDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [showAssignmentDetailModal, setShowAssignmentDetailModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [removingStudent, setRemovingStudent] = useState<string | null>(null);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deletingClass, setDeletingClass] = useState(false);
  const [editingClass, setEditingClass] = useState(false);
  const [editClassTab, setEditClassTab] = useState<"basic" | "appearance">("basic");
  const [showClassMenu, setShowClassMenu] = useState(false);
  const classMenuRef = useRef<HTMLDivElement>(null);

  // File upload states
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [postFiles, setPostFiles] = useState<File[]>([]);

  // Files tab states
  const [classFiles, setClassFiles] = useState<any[]>([]);
  const [classFolders, setClassFolders] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [showUploadFilesModal, setShowUploadFilesModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [directUploadFiles, setDirectUploadFiles] = useState<File[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [showMoveFileModal, setShowMoveFileModal] = useState(false);
  const [fileToMove, setFileToMove] = useState<any | null>(null);

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

  // Post form
  const [postForm, setPostForm] = useState({
    content: "",
    type: "announcement" as Post["type"],
  });
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Class form
  const [classForm, setClassForm] = useState({
    name: "",
    subject: "",
    description: "",
    section: "",
    room: "",
    color: "pink",
    icon: "book",
    banner: "gradient-1",
  });

  useEffect(() => {
    if (user) {
      fetchClassData();
      fetchAssignments();
      fetchPosts();
      fetchClassFiles();
      fetchClassFolders();
    }
  }, [user, classId]);

  useEffect(() => {
    if (classData) {
      fetchStudents();
    }
  }, [classData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (classMenuRef.current && !classMenuRef.current.contains(event.target as Node)) {
        setShowClassMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("classId", "==", classId)
      );
      const snapshot = await getDocs(postsQuery);
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Post[];

      setPosts(postsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchClassFiles = async () => {
    try {
      const filesQuery = query(
        collection(db, "classFiles"),
        where("classId", "==", classId)
      );
      const snapshot = await getDocs(filesQuery);
      const filesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
      }));

      setClassFiles(filesData.sort((a: any, b: any) => b.uploadedAt.getTime() - a.uploadedAt.getTime()));
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchClassFolders = async () => {
    try {
      const foldersQuery = query(
        collection(db, "classFolders"),
        where("classId", "==", classId)
      );
      const snapshot = await getDocs(foldersQuery);
      const foldersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));

      setClassFolders(foldersData.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Error fetching folders:", error);
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
    setUploadingFiles(true);
    try {
      // Upload files first
      let attachments: FileAttachment[] = [];
      if (assignmentFiles.length > 0) {
        attachments = await uploadMultipleFiles(
          assignmentFiles,
          classId,
          user.id,
          "assignments"
        );
      }

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
      if (attachments.length > 0) {
        assignmentData.attachments = attachments;
      }

      const assignmentRef = await addDoc(collection(db, "assignments"), assignmentData);

      // Create ClassFile documents for each attachment
      for (const attachment of attachments) {
        await addDoc(collection(db, "classFiles"), {
          classId,
          name: attachment.name,
          url: attachment.url,
          size: attachment.size,
          type: attachment.type,
          uploadedBy: user.id,
          uploadedByName: `${user.firstName} ${user.lastName}`,
          uploadedAt: new Date(),
          assignmentId: assignmentRef.id,
        });
      }

      // Auto-create a post for this assignment
      await addDoc(collection(db, "posts"), {
        classId,
        content: `New ${assignmentForm.type} posted: ${assignmentForm.title}`,
        type: "assignment",
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorPhotoURL: user.photoURL,
        assignmentId: assignmentRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setAssignmentForm({
        title: "",
        description: "",
        dueDate: "",
        points: "",
        type: "assignment",
      });
      setAssignmentFiles([]);
      setShowCreateAssignmentModal(false);
      await fetchAssignments();
      await fetchPosts();
    } catch (error) {
      console.error("Error creating assignment:", error);
    } finally {
      setCreatingAssignment(false);
      setUploadingFiles(false);
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

  const openAssignmentDetail = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentDetailModal(true);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreatingPost(true);
    setUploadingFiles(true);
    try {
      // Upload files first
      let attachments: FileAttachment[] = [];
      if (postFiles.length > 0) {
        attachments = await uploadMultipleFiles(
          postFiles,
          classId,
          user.id,
          "posts"
        );
      }

      const postData: any = {
        classId,
        content: postForm.content,
        type: postForm.type,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorPhotoURL: user.photoURL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (attachments.length > 0) {
        postData.attachments = attachments;
      }

      const postRef = await addDoc(collection(db, "posts"), postData);

      // Create ClassFile documents for each attachment
      for (const attachment of attachments) {
        await addDoc(collection(db, "classFiles"), {
          classId,
          name: attachment.name,
          url: attachment.url,
          size: attachment.size,
          type: attachment.type,
          uploadedBy: user.id,
          uploadedByName: `${user.firstName} ${user.lastName}`,
          uploadedAt: new Date(),
          postId: postRef.id,
        });
      }

      setPostForm({ content: "", type: "announcement" });
      setPostFiles([]);
      setShowCreatePostModal(false);
      await fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setCreatingPost(false);
      setUploadingFiles(false);
    }
  };

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setEditingPostId(editingPost.id);
    try {
      await updateDoc(doc(db, "posts", editingPost.id), {
        content: postForm.content,
        type: postForm.type,
        updatedAt: new Date(),
      });

      setPostForm({ content: "", type: "announcement" });
      setEditingPost(null);
      setShowEditPostModal(false);
      await fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setEditingPostId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeletingPost(postId);
    try {
      await deleteDoc(doc(db, "posts", postId));
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeletingPost(null);
    }
  };

  const openEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      content: post.content,
      type: post.type,
    });
    setShowEditPostModal(true);
  };

  const openEditClass = () => {
    if (!classData) return;
    setClassForm({
      name: classData.name,
      subject: classData.subject,
      description: classData.description || "",
      section: classData.section || "",
      room: classData.room || "",
      color: classData.color || "pink",
      icon: classData.icon || "book",
      banner: classData.banner || "gradient-1",
    });
    setEditClassTab("basic");
    setShowEditClassModal(true);
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classData) return;

    setEditingClass(true);
    try {
      const colorData = getClassColor(classForm.color);
      const updateData = {
        name: classForm.name,
        subject: classForm.subject,
        description: classForm.description,
        section: classForm.section,
        room: classForm.room,
        color: classForm.color,
        icon: classForm.icon,
        banner: classForm.banner,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "classes", classId), updateData);

      setShowEditClassModal(false);
      await fetchClassData();
    } catch (error) {
      console.error("Error updating class:", error);
    } finally {
      setEditingClass(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone and will delete all assignments and posts.")) return;

    setDeletingClass(true);
    try {
      // Delete all assignments
      const assignmentsQuery = query(collection(db, "assignments"), where("classId", "==", classId));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const deleteAssignments = assignmentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteAssignments);

      // Delete all posts
      const postsQuery = query(collection(db, "posts"), where("classId", "==", classId));
      const postsSnapshot = await getDocs(postsQuery);
      const deletePosts = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePosts);

      // Delete the class
      await deleteDoc(doc(db, "classes", classId));

      // Redirect to teacher dashboard
      router.push("/teacher");
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete class. Please try again.");
    } finally {
      setDeletingClass(false);
    }
  };

  const handleDirectFileUpload = async () => {
    if (!user || directUploadFiles.length === 0) return;

    setUploadingFiles(true);
    try {
      const attachments = await uploadMultipleFiles(
        directUploadFiles,
        classId,
        user.id,
        currentFolderId ? `folders/${currentFolderId}` : "files"
      );

      // Create ClassFile documents
      for (const attachment of attachments) {
        await addDoc(collection(db, "classFiles"), {
          classId,
          name: attachment.name,
          url: attachment.url,
          size: attachment.size,
          type: attachment.type,
          uploadedBy: user.id,
          uploadedByName: `${user.firstName} ${user.lastName}`,
          uploadedAt: new Date(),
          folderId: currentFolderId,
        });
      }

      setDirectUploadFiles([]);
      setShowUploadFilesModal(false);
      await fetchClassFiles();
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      await addDoc(collection(db, "classFolders"), {
        classId,
        name: newFolderName,
        parentId: currentFolderId,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setNewFolderName("");
      setShowCreateFolderModal(false);
      await fetchClassFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await deleteDoc(doc(db, "classFiles", fileId));
      await fetchClassFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder? All files inside will also be deleted.")) return;

    try {
      // Delete all files in the folder
      const filesInFolder = classFiles.filter((f: any) => (f.folderId || null) === folderId);
      for (const file of filesInFolder) {
        await deleteDoc(doc(db, "classFiles", file.id));
      }

      // Delete the folder
      await deleteDoc(doc(db, "classFolders", folderId));

      await fetchClassFiles();
      await fetchClassFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleMoveFile = async (fileId: string, targetFolderId: string | null) => {
    try {
      await updateDoc(doc(db, "classFiles", fileId), {
        folderId: targetFolderId,
        updatedAt: new Date(),
      });
      await fetchClassFiles();
      setShowMoveFileModal(false);
      setFileToMove(null);
    } catch (error) {
      console.error("Error moving file:", error);
    }
  };

  const handleFileDragStart = (fileId: string) => {
    setDraggedFileId(fileId);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  const handleFolderDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    if (draggedFileId) {
      await handleMoveFile(draggedFileId, targetFolderId);
      setDraggedFileId(null);
      setDragOverFolderId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedFileId(null);
    setDragOverFolderId(null);
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
    <div className="min-h-screen">
      {/* Back Button - Above Banner */}
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

      {/* Header */}
      <div
        className={`relative p-8 text-white shadow-xl bg-gradient-to-r ${getClassBanner(classData.banner).gradient} mx-3 rounded-2xl overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-start justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-4"
            >
              {(() => {
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
                }[getClassIconName(classData.icon)];

                return IconComponent ? (
                  <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-2xl flex items-center justify-center flex-shrink-0">
                    <IconComponent className="size-9 text-white" />
                  </div>
                ) : null;
              })()}
              <div>
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
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
              ref={classMenuRef}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowClassMenu(!showClassMenu)}
                className="size-9 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/20 shadow-sm transition-all flex items-center justify-center cursor-pointer"
              >
                <MoreVertical className="size-4" />
              </motion.button>

              {showClassMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      openEditClass();
                      setShowClassMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                  >
                    <Edit className="size-4 text-blue-600" />
                    <span className="text-sm font-bold text-gray-700">
                      Edit Class
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setShowClassMenu(false);
                      handleDeleteClass();
                    }}
                    disabled={deletingClass}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left disabled:opacity-50 cursor-pointer"
                  >
                    {deletingClass ? (
                      <>
                        <Loader2 className="size-4 text-red-600 animate-spin" />
                        <span className="text-sm font-bold text-red-600">
                          Deleting...
                        </span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-4 text-red-600" />
                        <span className="text-sm font-bold text-red-600">
                          Delete Class
                        </span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
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
              { id: "files", label: "Files", icon: FolderOpen, count: classFiles.length },
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
              {/* Create Post Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">
                  Class Stream
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreatePostModal(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Create Post
                </motion.button>
              </div>

              {/* Stream */}
              {posts.length === 0 ? (
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center shadow-lg">
                  <Home className="size-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600 font-medium mb-6">
                    Share announcements, materials, and updates with your class
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreatePostModal(true)}
                    className="px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    Create Your First Post
                  </motion.button>
                </div>
              ) : (
                <div>
                  {posts.map((post) => {
                    const relatedAssignment = post.assignmentId
                      ? assignments.find((a) => a.id === post.assignmentId)
                      : undefined;

                    return (
                      <StreamPost
                        key={post.id}
                        post={post}
                        assignment={relatedAssignment}
                        canEdit={true}
                        onEdit={() => openEditPost(post)}
                        onDelete={() => handleDeletePost(post.id)}
                        onAssignmentClick={
                          relatedAssignment
                            ? () => openAssignmentDetail(relatedAssignment)
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              )}
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
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="size-3.5" />
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
                      className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="size-3.5" />
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
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" />
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
                    className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
                  >
                    <Plus className="size-3.5" />
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
                      className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all group cursor-pointer"
                      onClick={() => openAssignmentDetail(assignment)}
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
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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

          {activeTab === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header with breadcrumb and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    onDragOver={(e) => handleFolderDragOver(e, null)}
                    onDrop={(e) => handleFolderDrop(e, null)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      dragOverFolderId === null && draggedFileId
                        ? "bg-blue-100 border-2 border-blue-400"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <h2 className="text-3xl font-black text-gray-900">Files</h2>
                  </div>
                  {currentFolderId && (
                    <>
                      <ChevronRight className="size-5 text-gray-400" />
                      <span className="text-xl font-bold text-gray-600">
                        {classFolders.find((f: any) => f.id === currentFolderId)?.name}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentFolderId && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentFolderId(null)}
                      className="px-3.5 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft className="size-3.5" />
                      Back
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateFolderModal(true)}
                    className="px-3.5 py-2 bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-700 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <FolderPlus className="size-3.5" />
                    New Folder
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadFilesModal(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Upload className="size-3.5" />
                    Upload Files
                  </motion.button>
                </div>
              </div>

              {/* Folders */}
              {classFolders.filter((f: any) => (f.parentId || null) === currentFolderId).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Folders
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {classFolders
                      .filter((f: any) => (f.parentId || null) === currentFolderId)
                      .map((folder: any, index: number) => (
                        <motion.div
                          key={folder.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onClick={() => setCurrentFolderId(folder.id)}
                          onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                          onDrop={(e) => handleFolderDrop(e, folder.id)}
                          className={`bg-white border-2 rounded-2xl p-5 hover:shadow-xl transition-all group relative ${
                            dragOverFolderId === folder.id
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-100 hover:border-blue-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="size-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mb-3">
                                <FolderOpen className="size-7 text-white" />
                              </div>
                              <p className="font-black text-gray-900 truncate">
                                {folder.name}
                              </p>
                              <p className="text-xs text-gray-500 font-medium mt-1">
                                {classFiles.filter((f: any) => (f.folderId || null) === folder.id).length} files
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="size-4 text-red-500" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* Files */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Files ({classFiles.filter((f: any) => (f.folderId || null) === currentFolderId).length})
                </h3>
                {classFiles.filter((f: any) => (f.folderId || null) === currentFolderId).length === 0 ? (
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center shadow-lg">
                    <FolderOpen className="size-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      No files yet
                    </h3>
                    <p className="text-gray-600 font-medium mb-6">
                      Upload files to share with your class
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUploadFilesModal(true)}
                      className="px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all inline-flex items-center gap-2"
                    >
                      <Upload className="size-4" />
                      Upload Files
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {classFiles
                      .filter((f: any) => (f.folderId || null) === currentFolderId)
                      .map((file: any) => (
                        <FileCard
                          key={file.id}
                          file={{
                            id: file.id,
                            name: file.name,
                            url: file.url,
                            size: file.size,
                            type: file.type,
                            uploadedBy: file.uploadedBy,
                            uploadedAt: file.uploadedAt,
                          }}
                          mini
                          draggable
                          onDragStart={() => handleFileDragStart(file.id)}
                          onMove={() => {
                            setFileToMove(file);
                            setShowMoveFileModal(true);
                          }}
                          onDelete={() => handleDeleteFile(file.id)}
                        />
                      ))}
                  </div>
                )}
              </div>
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

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Attachments
                  </label>
                  <FileUpload
                    files={assignmentFiles}
                    onFilesChange={setAssignmentFiles}
                    disabled={creatingAssignment}
                    multiple
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

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !creatingPost && setShowCreatePostModal(false)}
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
                  Create Post
                </h2>
                <button
                  onClick={() => setShowCreatePostModal(false)}
                  disabled={creatingPost}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <Select
                  label="Post Type"
                  value={postForm.type}
                  onChange={(e) =>
                    setPostForm({
                      ...postForm,
                      type: e.target.value as Post["type"],
                    })
                  }
                  options={[
                    { value: "announcement", label: "Announcement" },
                    { value: "material", label: "Material" },
                  ]}
                  disabled={creatingPost}
                />

                <TextArea
                  label="Content"
                  required
                  value={postForm.content}
                  onChange={(e) =>
                    setPostForm({ ...postForm, content: e.target.value })
                  }
                  rows={6}
                  placeholder="Write your post content here..."
                  disabled={creatingPost}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Attachments
                  </label>
                  <FileUpload
                    files={postFiles}
                    onFilesChange={setPostFiles}
                    disabled={creatingPost}
                    multiple
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePostModal(false)}
                    disabled={creatingPost}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingPost}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creatingPost ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="size-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Posting...
                      </>
                    ) : (
                      "Create Post"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {showEditPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !editingPostId && setShowEditPostModal(false)}
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
                  Edit Post
                </h2>
                <button
                  onClick={() => setShowEditPostModal(false)}
                  disabled={!!editingPostId}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleEditPost} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <Select
                  label="Post Type"
                  value={postForm.type}
                  onChange={(e) =>
                    setPostForm({
                      ...postForm,
                      type: e.target.value as Post["type"],
                    })
                  }
                  options={[
                    { value: "announcement", label: "Announcement" },
                    { value: "material", label: "Material" },
                  ]}
                  disabled={!!editingPostId}
                />

                <TextArea
                  label="Content"
                  required
                  value={postForm.content}
                  onChange={(e) =>
                    setPostForm({ ...postForm, content: e.target.value })
                  }
                  rows={6}
                  placeholder="Write your post content here..."
                  disabled={!!editingPostId}
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditPostModal(false)}
                    disabled={!!editingPostId}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!editingPostId}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {editingPostId ? (
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

      {/* Assignment Detail Modal */}
      <AnimatePresence>
        {showAssignmentDetailModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4"
            onClick={() => setShowAssignmentDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border-2 border-gray-100"
            >
              {/* Header */}
              <div className="relative p-8 bg-gradient-to-br from-purple-500 to-blue-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-600/20 backdrop-blur-sm" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg uppercase tracking-wider border border-white/30">
                          {selectedAssignment.type}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black mb-2">
                        {selectedAssignment.title}
                      </h2>
                      <div className="flex items-center gap-6 text-sm font-semibold text-white/90">
                        {selectedAssignment.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <span>
                              Due {selectedAssignment.dueDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        {selectedAssignment.points && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {selectedAssignment.points} points
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAssignmentDetailModal(false)}
                      className="size-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(85vh-280px)]">
                {selectedAssignment.description ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      Instructions
                    </h3>
                    <p className="text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
                      {selectedAssignment.description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-6 text-center">
                    <FileText className="size-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No instructions provided
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                      Attachments ({selectedAssignment.attachments.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedAssignment.attachments.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignment Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border-2 border-purple-100 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Calendar className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Due Date
                        </p>
                        <p className="text-lg font-black text-gray-900">
                          {selectedAssignment.dueDate
                            ? selectedAssignment.dueDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                weekday: 'short'
                              })
                            : 'No due date'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-green-100 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <FileText className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Points Possible
                        </p>
                        <p className="text-lg font-black text-gray-900">
                          {selectedAssignment.points || 'Ungraded'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Teacher Actions */}
              <div className="p-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAssignmentDetailModal(false);
                      openEditAssignment(selectedAssignment);
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center gap-2"
                  >
                    <Edit className="size-4" />
                    Edit Assignment
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAssignmentDetailModal(false);
                      handleDeleteAssignment(selectedAssignment.id);
                    }}
                    disabled={deletingAssignment === selectedAssignment.id}
                    className="px-5 py-3 bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-200 text-red-600 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingAssignment === selectedAssignment.id ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-4" />
                        Delete
                      </>
                    )}
                  </motion.button>
                </div>
                <button
                  onClick={() => setShowAssignmentDetailModal(false)}
                  className="px-5 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-white hover:border-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Class Modal */}
      <AnimatePresence>
        {showEditClassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
            onClick={() => !editingClass && setShowEditClassModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[75vh] overflow-hidden border-2 border-gray-100"
            >
              <div className="sticky top-0 z-10 border-b-2 border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">Customize Class</h2>
                  <button
                    onClick={() => setShowEditClassModal(false)}
                    disabled={editingClass}
                    className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <X className="size-5 text-gray-600" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6">
                  <button
                    type="button"
                    onClick={() => setEditClassTab("basic")}
                    className={`relative px-4 py-3 font-bold text-sm transition-colors ${
                      editClassTab === "basic"
                        ? "text-pink-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Basic Info
                    {editClassTab === "basic" && (
                      <motion.div
                        layoutId="editClassTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-600"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditClassTab("appearance")}
                    className={`relative px-4 py-3 font-bold text-sm transition-colors ${
                      editClassTab === "appearance"
                        ? "text-pink-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Appearance
                    {editClassTab === "appearance" && (
                      <motion.div
                        layoutId="editClassTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-600"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditClass} className="flex flex-col">
                <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: "calc(75vh - 220px)" }}>
                <AnimatePresence mode="wait">
                {editClassTab === "basic" && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      label="Class Name"
                      required
                      value={classForm.name}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                      placeholder="AP Calculus"
                      disabled={editingClass}
                    />
                    <TextField
                      label="Subject"
                      required
                      value={classForm.subject}
                      onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                      placeholder="Mathematics"
                      disabled={editingClass}
                    />
                  </div>
                  <TextArea
                    label="Description"
                    value={classForm.description}
                    onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                    rows={3}
                    placeholder="Class description..."
                    disabled={editingClass}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      label="Section"
                      value={classForm.section}
                      onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                      placeholder="A"
                      disabled={editingClass}
                    />
                    <TextField
                      label="Room"
                      value={classForm.room}
                      onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                      placeholder="101"
                      disabled={editingClass}
                    />
                  </div>
                  </motion.div>
                )}

                {editClassTab === "appearance" && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                {/* Icon Selector */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Class Icon
                  </h3>
                  <div className="grid grid-cols-6 gap-3">
                    {CLASS_ICONS.map((icon) => {
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
                      }[icon.component];

                      return (
                        <motion.button
                          key={icon.id}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setClassForm({ ...classForm, icon: icon.id })}
                          disabled={editingClass}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            classForm.icon === icon.id
                              ? "border-pink-500 bg-pink-50 shadow-lg"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          {IconComponent && (
                            <IconComponent
                              className={`size-6 mx-auto ${
                                classForm.icon === icon.id ? "text-pink-600" : "text-gray-600"
                              }`}
                            />
                          )}
                          {classForm.icon === icon.id && (
                            <div className="absolute -top-1 -right-1 size-5 bg-pink-500 rounded-full flex items-center justify-center">
                              <Check className="size-3 text-white" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selector */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Theme Color
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {CLASS_COLORS.map((color) => (
                      <motion.button
                        key={color.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setClassForm({ ...classForm, color: color.id })}
                        disabled={editingClass}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          classForm.color === color.id
                            ? `${color.border} ${color.bg} shadow-lg`
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className={`size-full rounded-lg bg-gradient-to-br ${color.gradient}`} />
                        {classForm.color === color.id && (
                          <div className="absolute -top-1 -right-1 size-5 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="size-3 text-white" />
                          </div>
                        )}
                        <p className="text-xs font-bold text-gray-700 mt-2">{color.name}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Banner Selector */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Header Banner
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {CLASS_BANNERS.map((banner) => (
                      <motion.button
                        key={banner.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setClassForm({ ...classForm, banner: banner.id })}
                        disabled={editingClass}
                        className={`relative p-1 rounded-xl border-2 transition-all ${
                          classForm.banner === banner.id
                            ? "border-pink-500 shadow-lg"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`h-20 rounded-lg bg-gradient-to-r ${banner.gradient}`}
                        />
                        {classForm.banner === banner.id && (
                          <div className="absolute -top-2 -right-2 size-6 bg-pink-500 rounded-full flex items-center justify-center">
                            <Check className="size-4 text-white" />
                          </div>
                        )}
                        <p className="text-xs font-bold text-gray-700 mt-2 text-center">
                          {banner.name}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
                  </motion.div>
                )}
                </AnimatePresence>
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 p-6 border-t-2 border-gray-100 bg-white flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditClassModal(false)}
                    disabled={editingClass}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingClass}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {editingClass ? (
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

      {/* Upload Files Modal */}
      <AnimatePresence>
        {showUploadFilesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !uploadingFiles && setShowUploadFilesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-gray-100"
            >
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
                <h2 className="text-2xl font-black text-gray-900">Upload Files</h2>
                <button
                  onClick={() => setShowUploadFilesModal(false)}
                  disabled={uploadingFiles}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <FileUpload
                  files={directUploadFiles}
                  onFilesChange={setDirectUploadFiles}
                  disabled={uploadingFiles}
                  multiple
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadFilesModal(false)}
                    disabled={uploadingFiles}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDirectFileUpload}
                    disabled={uploadingFiles || directUploadFiles.length === 0}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadingFiles ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="size-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        Upload Files
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showCreateFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !creatingFolder && setShowCreateFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-100"
            >
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-2xl font-black text-gray-900">New Folder</h2>
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  disabled={creatingFolder}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
                <TextField
                  label="Folder Name"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="My Folder"
                  disabled={creatingFolder}
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateFolderModal(false)}
                    disabled={creatingFolder}
                    className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingFolder}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creatingFolder ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="size-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FolderPlus className="size-4" />
                        Create Folder
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move File Modal */}
      <AnimatePresence>
        {showMoveFileModal && fileToMove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowMoveFileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-100 max-h-[70vh] flex flex-col"
            >
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Move File</h2>
                  <p className="text-sm font-medium text-gray-600 mt-1 truncate">
                    {fileToMove.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowMoveFileModal(false)}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-3 overflow-y-auto flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Select Destination
                </h3>

                {/* Root folder option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMoveFile(fileToMove.id, null)}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                    (fileToMove.folderId || null) === null
                      ? "border-pink-300 bg-pink-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="size-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                    <FolderOpen className="size-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900">Root Directory</p>
                    <p className="text-xs text-gray-500">
                      {classFiles.filter((f: any) => (f.folderId || null) === null).length} files
                    </p>
                  </div>
                  {(fileToMove.folderId || null) === null && (
                    <Check className="size-5 text-pink-600" />
                  )}
                </motion.button>

                {/* Folder options */}
                {classFolders.map((folder: any) => (
                  <motion.button
                    key={folder.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMoveFile(fileToMove.id, folder.id)}
                    className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                      fileToMove.folderId === folder.id
                        ? "border-pink-300 bg-pink-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <FolderOpen className="size-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-900">{folder.name}</p>
                      <p className="text-xs text-gray-500">
                        {classFiles.filter((f: any) => (f.folderId || null) === folder.id).length} files
                      </p>
                    </div>
                    {fileToMove.folderId === folder.id && (
                      <Check className="size-5 text-pink-600" />
                    )}
                  </motion.button>
                ))}

                {classFolders.length === 0 && (
                  <div className="text-center py-8">
                    <FolderOpen className="size-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      No folders yet. Create one to organize your files!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
