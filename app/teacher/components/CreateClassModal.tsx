"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TextField, TextArea } from "@/components/common/Form";

const CLASS_COLORS = [
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#a855f7" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
];

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    name: string;
    subject: string;
    description: string;
    section: string;
    room: string;
    color: string;
  };
  onFormDataChange: (data: CreateClassModalProps['formData']) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
}

export function CreateClassModal({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  onSubmit,
  creating,
}: CreateClassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => !creating && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-100"
          >
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-2xl font-black text-gray-900">
                Create New Class
              </h2>
              <button
                onClick={() => !creating && onClose()}
                disabled={creating}
                className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X className="size-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <TextField
                label="Class Name"
                required
                value={formData.name}
                onChange={(e) =>
                  onFormDataChange({ ...formData, name: e.target.value })
                }
                placeholder="e.g., AP Biology"
                disabled={creating}
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Subject"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, subject: e.target.value })
                  }
                  placeholder="e.g., Biology"
                  disabled={creating}
                />
                <TextField
                  label="Section"
                  value={formData.section}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, section: e.target.value })
                  }
                  placeholder="e.g., A"
                  disabled={creating}
                />
              </div>

              <TextField
                label="Room"
                value={formData.room}
                onChange={(e) =>
                  onFormDataChange({ ...formData, room: e.target.value })
                }
                placeholder="e.g., 204"
                disabled={creating}
              />

              <TextArea
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Brief description of the class..."
                disabled={creating}
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Class Color
                </label>
                <div className="flex gap-3">
                  {CLASS_COLORS.map((color) => (
                    <motion.button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        !creating &&
                        onFormDataChange({ ...formData, color: color.value })
                      }
                      disabled={creating}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className={`size-12 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${
                        formData.color === color.value
                          ? "ring-4 ring-gray-900 ring-offset-2 scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={creating}
                  className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
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
                      Creating...
                    </>
                  ) : (
                    "Create Class"
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
