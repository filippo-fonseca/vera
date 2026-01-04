"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Select, TextArea } from "@/components/common/Form";
import FileUpload from "@/components/files/FileUpload";
import { Post } from "@/lib/types";

interface PostFormData {
  content: string;
  type: Post["type"];
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PostFormData;
  onFormChange: (data: PostFormData) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  creating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  formData,
  onFormChange,
  files,
  onFilesChange,
  creating,
  onSubmit,
}: CreatePostModalProps) {
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
                Create Post
              </h2>
              <button
                onClick={onClose}
                disabled={creating}
                className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X className="size-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Select
                label="Post Type"
                value={formData.type}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    type: e.target.value as Post["type"],
                  })
                }
                options={[
                  { value: "announcement", label: "Announcement" },
                  { value: "material", label: "Material" },
                ]}
                disabled={creating}
              />

              <TextArea
                label="Content"
                required
                value={formData.content}
                onChange={(e) =>
                  onFormChange({ ...formData, content: e.target.value })
                }
                rows={6}
                placeholder="Write your post content here..."
                disabled={creating}
              />

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Attachments
                </label>
                <FileUpload
                  files={files}
                  onFilesChange={onFilesChange}
                  disabled={creating}
                  multiple
                />
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
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="size-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Posting...
                    </>
                  ) : (
                    "Create Post"
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
