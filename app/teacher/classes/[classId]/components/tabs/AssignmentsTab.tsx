"use client";

import { motion } from "framer-motion";
import { Plus, FileText, Calendar, Edit, Trash2, Loader2 } from "lucide-react";
import { Assignment } from "@/lib/types";

interface AssignmentsTabProps {
  assignments: Assignment[];
  deletingAssignment: string | null;
  onCreateAssignment: () => void;
  onEditAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onAssignmentClick: (assignment: Assignment) => void;
}

export default function AssignmentsTab({
  assignments,
  deletingAssignment,
  onCreateAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onAssignmentClick,
}: AssignmentsTabProps) {
  return (
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
          onClick={onCreateAssignment}
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
            onClick={onCreateAssignment}
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
              onClick={() => onAssignmentClick(assignment)}
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
                    onClick={() => onEditAssignment(assignment)}
                    className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors group/btn"
                  >
                    <Edit className="size-4 text-gray-400 group-hover/btn:text-blue-600 transition-colors" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteAssignment(assignment.id)}
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
  );
}
