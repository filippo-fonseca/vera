"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Award,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Assignment, AssignmentSubmission } from "@/lib/types";
import FileUpload from "@/components/files/FileUpload";
import FileCard from "@/components/files/FileCard";

interface AssignmentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  submission?: AssignmentSubmission;
  files: File[];
  onFilesChange: (files: File[]) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const getAssignmentTypeColor = (type: Assignment["type"]) => {
  switch (type) {
    case "assignment":
      return "from-purple-500 to-purple-600";
    case "quiz":
      return "from-blue-500 to-blue-600";
    case "exam":
      return "from-red-500 to-red-600";
    case "project":
      return "from-green-500 to-green-600";
    default:
      return "from-gray-500 to-gray-600";
  }
};

export default function AssignmentSubmissionModal({
  isOpen,
  onClose,
  assignment,
  submission,
  files,
  onFilesChange,
  submitting,
  onSubmit,
}: AssignmentSubmissionModalProps) {
  if (!assignment) return null;

  const isOverdue =
    assignment.dueDate && new Date() > assignment.dueDate && !submission;
  const canSubmit = !submission || submission.status !== "graded";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => !submitting && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-100"
          >
            {/* Header */}
            <div
              className={`p-6 border-b-2 border-gray-100 bg-gradient-to-r ${getAssignmentTypeColor(
                assignment.type
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-lg">
                      {assignment.type.charAt(0).toUpperCase() +
                        assignment.type.slice(1)}
                    </span>
                    {submission && (
                      <span
                        className={`px-3 py-1 backdrop-blur-sm text-white text-xs font-bold rounded-lg ${
                          submission.status === "late"
                            ? "bg-orange-500/30"
                            : submission.grade !== undefined
                            ? "bg-green-500/30"
                            : "bg-blue-500/30"
                        }`}
                      >
                        {submission.status === "late"
                          ? "Submitted Late"
                          : submission.grade !== undefined
                          ? "Graded"
                          : "Submitted"}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {assignment.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="size-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Assignment Details */}
              <div className="grid grid-cols-2 gap-4">
                {assignment.dueDate && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <Calendar className="size-5 text-pink-500" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Due Date
                      </p>
                      <p className="text-sm font-black text-gray-900">
                        {assignment.dueDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {assignment.points && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <Award className="size-5 text-pink-500" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Points
                      </p>
                      <p className="text-sm font-black text-gray-900">
                        {assignment.points} points
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {assignment.description && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                    Instructions
                  </h3>
                  <p className="text-gray-700 font-medium whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                </div>
              )}

              {/* Assignment Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
                    Assignment Files
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {assignment.attachments.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        onDelete={() => {}}
                        onDownload={() => window.open(file.url, "_blank")}
                        onMove={() => {}}
                        showActions={false}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Status & Grade */}
              {submission && (
                <div className="border-2 border-gray-100 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-1">
                        Your Submission
                      </h3>
                      <p className="text-xs text-gray-600 font-medium">
                        Submitted on{" "}
                        {submission.submittedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Grade Display */}
                    {submission.grade !== undefined ? (
                      <div className="text-right">
                        <div className="text-3xl font-black text-green-600">
                          {submission.grade}
                          {assignment.points && (
                            <span className="text-lg text-gray-400">
                              /{assignment.points}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-green-600 uppercase">
                          Graded
                        </p>
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-gray-100 rounded-lg">
                        <p className="text-sm font-black text-gray-700">
                          Ungraded
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-100 rounded-lg">
                      <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">
                        Teacher Feedback
                      </h4>
                      <p className="text-sm text-gray-700 font-medium">
                        {submission.feedback}
                      </p>
                    </div>
                  )}

                  {/* Submitted Files */}
                  {submission.attachments && submission.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Your Files
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {submission.attachments.map((file) => (
                          <FileCard
                            key={file.id}
                            file={file}
                            onDelete={() => {}}
                            onDownload={() => window.open(file.url, "_blank")}
                            onMove={() => {}}
                            showActions={false}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Overdue Warning */}
              {isOverdue && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                  <AlertCircle className="size-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-900">
                      This assignment is overdue
                    </p>
                    <p className="text-xs text-orange-700 font-medium">
                      Your submission will be marked as late
                    </p>
                  </div>
                </div>
              )}

              {/* File Upload (only if not submitted or not graded) */}
              {canSubmit && !submission && (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
                      Submit Your Work
                    </h3>
                    <FileUpload files={files} onFilesChange={onFilesChange} />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={submitting}
                      className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || files.length === 0}
                      className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
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
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          Submit Assignment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
