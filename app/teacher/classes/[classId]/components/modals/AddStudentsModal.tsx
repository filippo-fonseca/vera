"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2 } from "lucide-react";
import { TextField } from "@/components/common/Form";
import { Student } from "@/lib/types";

interface AddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchingStudents: boolean;
  availableStudents: Student[];
  addingStudent: boolean;
  onAddStudent: (studentId: string) => void;
}

export default function AddStudentsModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  searchingStudents,
  availableStudents,
  addingStudent,
  onAddStudent,
}: AddStudentsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => !addingStudent && onClose()}
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
                onClick={onClose}
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
                onChange={(e) => onSearchChange(e.target.value)}
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
                  <Search className="size-16 text-gray-300 mx-auto mb-3" />
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
                        onClick={() => onAddStudent(student.id)}
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
  );
}
