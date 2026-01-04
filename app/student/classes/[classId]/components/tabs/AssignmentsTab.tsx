"use client";

import { motion } from "framer-motion";
import { FileText, Calendar, Award, CheckCircle, Clock, XCircle } from "lucide-react";
import { Assignment, AssignmentSubmission } from "@/lib/types";

interface AssignmentsTabProps {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  onAssignmentClick: (assignment: Assignment) => void;
  getSubmissionForAssignment: (assignmentId: string) => AssignmentSubmission | undefined;
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

const getStatusBadge = (
  assignment: Assignment,
  submission?: AssignmentSubmission
) => {
  if (!submission) {
    // Check if overdue
    if (assignment.dueDate && new Date() > assignment.dueDate) {
      return {
        icon: XCircle,
        text: "Missing",
        color: "bg-red-100 text-red-700 border-red-200",
      };
    }
    return {
      icon: Clock,
      text: "Not Submitted",
      color: "bg-gray-100 text-gray-700 border-gray-200",
    };
  }

  if (submission.status === "late") {
    return {
      icon: Clock,
      text: "Submitted Late",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    };
  }

  if (submission.grade !== undefined) {
    return {
      icon: CheckCircle,
      text: "Graded",
      color: "bg-green-100 text-green-700 border-green-200",
    };
  }

  return {
    icon: CheckCircle,
    text: "Submitted",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  };
};

export default function AssignmentsTab({
  assignments,
  submissions,
  onAssignmentClick,
  getSubmissionForAssignment,
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
        <h2 className="text-3xl font-black text-gray-900">Assignments</h2>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center shadow-lg">
          <FileText className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900 mb-2">
            No assignments yet
          </h3>
          <p className="text-gray-600 font-medium">
            Your teacher hasn't created any assignments yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment, index) => {
            const submission = getSubmissionForAssignment(assignment.id);
            const status = getStatusBadge(assignment, submission);
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => onAssignmentClick(assignment)}
                className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
              >
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1.5 bg-gradient-to-r ${getAssignmentTypeColor(
                      assignment.type
                    )} text-white text-xs font-bold rounded-lg shadow-md`}
                  >
                    {assignment.type.charAt(0).toUpperCase() +
                      assignment.type.slice(1)}
                  </span>

                  {/* Status Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 ${status.color} text-xs font-bold`}
                  >
                    <StatusIcon className="size-3.5" />
                    {status.text}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {assignment.title}
                </h3>

                {/* Description */}
                {assignment.description && (
                  <p className="text-sm text-gray-600 font-medium mb-4 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                  {/* Due Date */}
                  {assignment.dueDate && (
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <Calendar className="size-4 text-pink-500" />
                      {assignment.dueDate.toLocaleDateString()}
                    </div>
                  )}

                  {/* Points/Grade */}
                  <div className="flex items-center gap-2">
                    {submission?.grade !== undefined ? (
                      <div className="px-3 py-1.5 bg-green-100 rounded-lg">
                        <span className="text-sm font-black text-green-700">
                          {submission.grade}
                          {assignment.points ? `/${assignment.points}` : ""}
                        </span>
                      </div>
                    ) : submission ? (
                      <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                        <span className="text-sm font-black text-gray-700">
                          Ungraded
                        </span>
                      </div>
                    ) : assignment.points ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 rounded-lg">
                        <Award className="size-4 text-pink-600" />
                        <span className="text-sm font-black text-pink-700">
                          {assignment.points} pts
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
