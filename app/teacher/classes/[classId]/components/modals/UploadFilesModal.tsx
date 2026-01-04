"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import FileUpload from "@/components/files/FileUpload";

interface UploadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  uploading: boolean;
  onUpload: () => void;
}

export default function UploadFilesModal({
  isOpen,
  onClose,
  files,
  onFilesChange,
  uploading,
  onUpload,
}: UploadFilesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => !uploading && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-gray-100"
          >
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-2xl font-black text-gray-900">Upload Files</h2>
              <button
                onClick={onClose}
                disabled={uploading}
                className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X className="size-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <FileUpload
                files={files}
                onFilesChange={onFilesChange}
                disabled={uploading}
                multiple
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onUpload}
                  disabled={uploading || files.length === 0}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="size-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      Upload Files
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
