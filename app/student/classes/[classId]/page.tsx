"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Class, Assignment, Post, AssignmentSubmission } from "@/lib/types";
import BackButton from "@/app/teacher/classes/[classId]/components/BackButton";
import ClassHeader from "@/app/teacher/classes/[classId]/components/ClassHeader";
import ClassTabs, { TabType } from "@/app/teacher/classes/[classId]/components/ClassTabs";
import StreamTab from "./components/tabs/StreamTab";
import AssignmentsTab from "./components/tabs/AssignmentsTab";
import FilesTab from "@/app/teacher/classes/[classId]/components/tabs/FilesTab";
import AssignmentSubmissionModal from "./components/modals/AssignmentSubmissionModal";
import { uploadMultipleFiles } from "@/lib/storage";

export default function StudentClassPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [classData, setClassData] = useState<Class | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [classFiles, setClassFiles] = useState<any[]>([]);
  const [classFolders, setClassFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submission modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Files tab state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchClassData();
      fetchAssignments();
      fetchSubmissions();
      fetchPosts();
      fetchClassFiles();
      fetchClassFolders();
    }
  }, [user, classId]);

  const fetchClassData = async () => {
    try {
      const classDoc = await getDoc(doc(db, "classes", classId));
      if (classDoc.exists()) {
        const data = {
          id: classDoc.id,
          ...classDoc.data(),
          createdAt: classDoc.data().createdAt?.toDate(),
          updatedAt: classDoc.data().updatedAt?.toDate(),
        } as Class;

        // Verify student has access
        if (!data.studentIds.includes(user!.id)) {
          router.push("/student");
          return;
        }

        setClassData(data);
      }
    } catch (error) {
      console.error("Error fetching class:", error);
    } finally {
      setLoading(false);
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

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const submissionsQuery = query(
        collection(db, "submissions"),
        where("classId", "==", classId),
        where("studentId", "==", user.id)
      );
      const snapshot = await getDocs(submissionsQuery);
      const submissionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        gradedAt: doc.data().gradedAt?.toDate(),
      })) as AssignmentSubmission[];

      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error fetching submissions:", error);
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

      setPosts(
        postsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      );
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

      setClassFiles(filesData);
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

      setClassFolders(foldersData);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAssignment || submissionFiles.length === 0) return;

    setSubmitting(true);
    try {
      // Upload files
      const uploadedFiles = await uploadMultipleFiles(
        submissionFiles,
        `submissions/${classId}/${selectedAssignment.id}/${user.id}`
      );

      // Determine if submission is late
      const now = new Date();
      const isLate = selectedAssignment.dueDate
        ? now > selectedAssignment.dueDate
        : false;

      // Create submission
      await addDoc(collection(db, "submissions"), {
        assignmentId: selectedAssignment.id,
        classId: classId,
        studentId: user.id,
        studentName: `${user.firstName} ${user.lastName}`,
        attachments: uploadedFiles,
        submittedAt: now,
        status: isLate ? "late" : "submitted",
      });

      // Refresh submissions
      await fetchSubmissions();

      // Close modal and reset
      setShowSubmissionModal(false);
      setSelectedAssignment(null);
      setSubmissionFiles([]);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionModal(true);
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find((s) => s.assignmentId === assignmentId);
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

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Class Not Found
          </h2>
          <p className="text-gray-600 font-medium">
            You don't have access to this class.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <BackButton />

      {/* Read-only ClassHeader - no edit/delete */}
      <ClassHeader
        classData={classData}
        onEditClass={() => {}} // No-op for students
        onDeleteClass={() => {}} // No-op for students
        deletingClass={false}
        isReadOnly={true}
      />

      <ClassTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentsCount={classData.studentIds.length}
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
              onCreatePost={() => {}} // Students can't create posts
              onEditPost={() => {}} // Students can't edit posts
              onDeletePost={() => {}} // Students can't delete posts
              onAssignmentClick={handleAssignmentClick}
              canEdit={false}
            />
          )}

          {activeTab === "assignments" && (
            <AssignmentsTab
              assignments={assignments}
              submissions={submissions}
              onAssignmentClick={handleAssignmentClick}
              getSubmissionForAssignment={getSubmissionForAssignment}
            />
          )}

          {activeTab === "files" && (
            <FilesTab
              classFiles={classFiles}
              classFolders={classFolders}
              currentFolderId={currentFolderId}
              draggedFileId={null}
              dragOverFolderId={null}
              onUploadFiles={() => {}} // Students can't upload
              onCreateFolder={() => {}} // Students can't create folders
              onBackToRoot={() => setCurrentFolderId(null)}
              onFolderClick={(folderId) => setCurrentFolderId(folderId)}
              onDeleteFolder={() => {}} // Students can't delete
              onFileDragStart={() => {}} // Students can't drag
              onFolderDragOver={() => {}} // Students can't drag
              onFolderDrop={() => {}} // Students can't drag
              onFileMove={() => {}} // Students can't move
              onFileDelete={() => {}} // Students can't delete
              isReadOnly={true}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Assignment Submission Modal */}
      <AssignmentSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          setSelectedAssignment(null);
          setSubmissionFiles([]);
        }}
        assignment={selectedAssignment}
        submission={
          selectedAssignment
            ? getSubmissionForAssignment(selectedAssignment.id)
            : undefined
        }
        files={submissionFiles}
        onFilesChange={setSubmissionFiles}
        submitting={submitting}
        onSubmit={handleSubmitAssignment}
      />
    </div>
  );
}
