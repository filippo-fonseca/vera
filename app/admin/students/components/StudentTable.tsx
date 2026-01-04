"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Mail, Clock } from "lucide-react";
import { Student, PendingInvite } from "@/lib/types";

interface StudentTableProps {
  students: Student[];
  pendingInvites: PendingInvite[];
  onDelete: (id: string) => void;
}

export function StudentTable({
  students,
  pendingInvites,
  onDelete,
}: StudentTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-md overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/50">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              {["Name", "Email", "Grade Level", "Student ID", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/30">
            <AnimatePresence>
              {students.length === 0 && pendingInvites.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No students found. Invite your first student to get started.
                  </td>
                </motion.tr>
              ) : (
                <>
                  {/* Pending Invites */}
                  {pendingInvites.map((invite, index) => (
                    <motion.tr
                      key={`invite-${invite.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-yellow-50/30 hover:to-orange-50/30 transition-all bg-yellow-50/20"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm shadow-md">
                            {invite.firstName?.[0]}
                            {invite.lastName?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invite.firstName} {invite.lastName}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-yellow-600">
                              <Clock size={12} />
                              Pending invitation
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {invite.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invite.gradeLevel || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invite.studentId || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(invite.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 size={14} />
                          Cancel
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}

                  {/* Active Students */}
                  {students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: (pendingInvites.length + index) * 0.05,
                      }}
                      className="hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-purple-50/30 transition-all"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {student.firstName?.[0]}
                            {student.lastName?.[0]}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.gradeLevel || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.studentId || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(student.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
