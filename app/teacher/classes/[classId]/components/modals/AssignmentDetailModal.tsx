"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FileText, Edit, Trash2, Loader2 } from "lucide-react";
import { Assignment } from "@/lib/types";
import FileCard from "@/components/files/FileCard";

interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignmentId: string) => void;
  deleting: boolean;
}

export default function AssignmentDetailModal({
  isOpen,
  onClose,
  assignment,
  onEdit,
  onDelete,
  deleting,
}: AssignmentDetailModalProps) {
  if (!assignment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4"
          onClick={onClose}
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
                        {assignment.type}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black mb-2">
                      {assignment.title}
                    </h2>
                    <div className="flex items-center gap-6 text-sm font-semibold text-white/90">
                      {assignment.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>
                            Due {assignment.dueDate.toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {assignment.points && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {assignment.points} points
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="size-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-280px)]">
              {assignment.description ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Instructions
                  </h3>
                  <p className="text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {assignment.description}
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
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Attachments ({assignment.attachments.length})
                  </h3>
                  <div className="space-y-3">
                    {assignment.attachments.map((file) => (
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
                        {assignment.dueDate
                          ? assignment.dueDate.toLocaleDateString('en-US', {
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
                        {assignment.points || 'Ungraded'}
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
                    onClose();
                    onEdit(assignment);
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
                    onClose();
                    onDelete(assignment.id);
                  }}
                  disabled={deleting}
                  className="px-5 py-3 bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-200 text-red-600 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
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
                onClick={onClose}
                className="px-5 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-white hover:border-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
