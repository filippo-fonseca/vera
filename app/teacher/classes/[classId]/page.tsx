"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
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
import { getClassColor } from "@/lib/classCustomization";
import { uploadMultipleFiles } from "@/lib/storage";
import StreamTab from "./components/tabs/StreamTab";
import StudentsTab from "./components/tabs/StudentsTab";
import AssignmentsTab from "./components/tabs/AssignmentsTab";
import FilesTab from "./components/tabs/FilesTab";
import BackButton from "./components/BackButton";
import ClassHeader from "./components/ClassHeader";
import ClassTabs, { TabType } from "./components/ClassTabs";
import AddStudentsModal from "./components/modals/AddStudentsModal";
import CreateAssignmentModal from "./components/modals/CreateAssignmentModal";
import EditAssignmentModal from "./components/modals/EditAssignmentModal";
import CreatePostModal from "./components/modals/CreatePostModal";
import EditPostModal from "./components/modals/EditPostModal";
import AssignmentDetailModal from "./components/modals/AssignmentDetailModal";
import EditClassModal from "./components/modals/EditClassModal";
import UploadFilesModal from "./components/modals/UploadFilesModal";
import CreateFolderModal from "./components/modals/CreateFolderModal";
import MoveFileModal from "./components/modals/MoveFileModal";

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
      <BackButton />

      <ClassHeader
        classData={classData}
        onEditClass={openEditClass}
        onDeleteClass={handleDeleteClass}
        deletingClass={deletingClass}
      />

      <ClassTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentsCount={students.length}
        assignmentsCount={assignments.length}
        filesCount={classFiles.length}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "stream" && (
            <StreamTab
              posts={posts}
              assignments={assignments}
              onCreatePost={() => setShowCreatePostModal(true)}
              onEditPost={openEditPost}
              onDeletePost={handleDeletePost}
              onAssignmentClick={openAssignmentDetail}
            />
          )}

          {activeTab === "students" && (
            <StudentsTab
              students={students}
              fetchingStudents={fetchingStudents}
              removingStudent={removingStudent}
              onAddStudent={() => setShowAddStudentModal(true)}
              onRemoveStudent={handleRemoveStudent}
            />
          )}

          {activeTab === "assignments" && (
            <AssignmentsTab
              assignments={assignments}
              deletingAssignment={deletingAssignment}
              onCreateAssignment={() => setShowCreateAssignmentModal(true)}
              onEditAssignment={openEditAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onAssignmentClick={openAssignmentDetail}
            />
          )}

          {activeTab === "files" && (
            <FilesTab
              classFiles={classFiles}
              classFolders={classFolders}
              currentFolderId={currentFolderId}
              draggedFileId={draggedFileId}
              dragOverFolderId={dragOverFolderId}
              onUploadFiles={() => setShowUploadFilesModal(true)}
              onCreateFolder={() => setShowCreateFolderModal(true)}
              onBackToRoot={() => setCurrentFolderId(null)}
              onFolderClick={setCurrentFolderId}
              onDeleteFolder={handleDeleteFolder}
              onFileDragStart={handleFileDragStart}
              onFolderDragOver={handleFolderDragOver}
              onFolderDrop={handleFolderDrop}
              onFileMove={(file) => {
                setFileToMove(file);
                setShowMoveFileModal(true);
              }}
              onFileDelete={handleDeleteFile}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AddStudentsModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchingStudents={searchingStudents}
        availableStudents={availableStudents}
        addingStudent={addingStudent}
        onAddStudent={handleAddStudent}
      />

      <CreateAssignmentModal
        isOpen={showCreateAssignmentModal}
        onClose={() => setShowCreateAssignmentModal(false)}
        formData={assignmentForm}
        onFormChange={setAssignmentForm}
        files={assignmentFiles}
        onFilesChange={setAssignmentFiles}
        creating={creatingAssignment}
        onSubmit={handleCreateAssignment}
      />

      <EditAssignmentModal
        isOpen={showEditAssignmentModal}
        onClose={() => setShowEditAssignmentModal(false)}
        formData={assignmentForm}
        onFormChange={setAssignmentForm}
        editing={!!editingAssignmentId}
        onSubmit={handleEditAssignment}
      />

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        formData={postForm}
        onFormChange={setPostForm}
        files={postFiles}
        onFilesChange={setPostFiles}
        creating={creatingPost}
        onSubmit={handleCreatePost}
      />

      <EditPostModal
        isOpen={showEditPostModal}
        onClose={() => setShowEditPostModal(false)}
        formData={postForm}
        onFormChange={setPostForm}
        editing={!!editingPostId}
        onSubmit={handleEditPost}
      />

      <AssignmentDetailModal
        isOpen={showAssignmentDetailModal}
        onClose={() => setShowAssignmentDetailModal(false)}
        assignment={selectedAssignment}
        onEdit={(assignment) => {
          setShowAssignmentDetailModal(false);
          openEditAssignment(assignment);
        }}
        onDelete={(assignmentId) => {
          setShowAssignmentDetailModal(false);
          handleDeleteAssignment(assignmentId);
        }}
        deleting={selectedAssignment ? deletingAssignment === selectedAssignment.id : false}
      />

      <EditClassModal
        isOpen={showEditClassModal}
        onClose={() => setShowEditClassModal(false)}
        formData={classForm}
        onFormChange={setClassForm}
        editing={editingClass}
        onSubmit={handleEditClass}
      />

      <UploadFilesModal
        isOpen={showUploadFilesModal}
        onClose={() => setShowUploadFilesModal(false)}
        files={directUploadFiles}
        onFilesChange={setDirectUploadFiles}
        uploading={uploadingFiles}
        onUpload={handleDirectFileUpload}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        folderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        creating={creatingFolder}
        onSubmit={handleCreateFolder}
      />

      <MoveFileModal
        isOpen={showMoveFileModal}
        onClose={() => setShowMoveFileModal(false)}
        file={fileToMove}
        folders={classFolders}
        files={classFiles}
        onMoveFile={handleMoveFile}
      />
    </div>
  );
}
