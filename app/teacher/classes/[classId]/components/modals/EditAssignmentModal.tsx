"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TextField, Select, DatePicker, TextArea } from "@/components/common/Form";
import { Assignment } from "@/lib/types";

interface AssignmentFormData {
  title: string;
  description: string;
  dueDate: string;
  points: string;
  type: Assignment["type"];
}

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: AssignmentFormData;
  onFormChange: (data: AssignmentFormData) => void;
  editing: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditAssignmentModal({
  isOpen,
  onClose,
  formData,
  onFormChange,
  editing,
  onSubmit,
}: EditAssignmentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => !editing && onClose()}
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
                onClick={onClose}
                disabled={editing}
                className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X className="size-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <TextField
                label="Title"
                required
                value={formData.title}
                onChange={(e) =>
                  onFormChange({ ...formData, title: e.target.value })
                }
                placeholder="Assignment title"
                disabled={editing}
              />

              <Select
                label="Type"
                value={formData.type}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    type: e.target.value as Assignment["type"],
                  })
                }
                options={[
                  { value: "assignment", label: "Assignment" },
                  { value: "quiz", label: "Quiz" },
                  { value: "exam", label: "Exam" },
                  { value: "project", label: "Project" },
                ]}
                disabled={editing}
              />

              <TextArea
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    description: e.target.value,
                  })
                }
                rows={4}
                placeholder="Assignment instructions..."
                disabled={editing}
              />

              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      dueDate: e.target.value,
                    })
                  }
                  disabled={editing}
                />
                <TextField
                  label="Points"
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      points: e.target.value,
                    })
                  }
                  placeholder="100"
                  disabled={editing}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={editing}
                  className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {editing ? (
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
  );
}
