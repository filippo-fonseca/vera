"use client";

import { motion } from "framer-motion";
import { UserPlus, Users, Loader2, Trash2 } from "lucide-react";
import { Student } from "@/lib/types";

interface StudentsTabProps {
  students: Student[];
  fetchingStudents: boolean;
  removingStudent: string | null;
  onAddStudent: () => void;
  onRemoveStudent: (studentId: string) => void;
}

export default function StudentsTab({
  students,
  fetchingStudents,
  removingStudent,
  onAddStudent,
  onRemoveStudent,
}: StudentsTabProps) {
  return (
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
          onClick={onAddStudent}
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
              onClick={onAddStudent}
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
                  onClick={() => onRemoveStudent(student.id)}
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
  );
}
