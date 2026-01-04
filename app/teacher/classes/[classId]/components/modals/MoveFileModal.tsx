"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FolderOpen, Check } from "lucide-react";

interface FileToMove {
  id: string;
  name: string;
  folderId?: string | null;
}

interface Folder {
  id: string;
  name: string;
}

interface MoveFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileToMove | null;
  folders: Folder[];
  files: any[];
  onMoveFile: (fileId: string, targetFolderId: string | null) => void;
}

export default function MoveFileModal({
  isOpen,
  onClose,
  file,
  folders,
  files,
  onMoveFile,
}: MoveFileModalProps) {
  if (!file) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-100 max-h-[70vh] flex flex-col"
          >
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Move File</h2>
                <p className="text-sm font-medium text-gray-600 mt-1 truncate">
                  {file.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors"
              >
                <X className="size-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                Select Destination
              </h3>

              {/* Root folder option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onMoveFile(file.id, null)}
                className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                  (file.folderId || null) === null
                    ? "border-pink-300 bg-pink-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="size-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                  <FolderOpen className="size-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">Root Directory</p>
                  <p className="text-xs text-gray-500">
                    {files.filter((f: any) => (f.folderId || null) === null).length} files
                  </p>
                </div>
                {(file.folderId || null) === null && (
                  <Check className="size-5 text-pink-600" />
                )}
              </motion.button>

              {/* Folder options */}
              {folders.map((folder: any) => (
                <motion.button
                  key={folder.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onMoveFile(file.id, folder.id)}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                    file.folderId === folder.id
                      ? "border-pink-300 bg-pink-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <FolderOpen className="size-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900">{folder.name}</p>
                    <p className="text-xs text-gray-500">
                      {files.filter((f: any) => (f.folderId || null) === folder.id).length} files
                    </p>
                  </div>
                  {file.folderId === folder.id && (
                    <Check className="size-5 text-pink-600" />
                  )}
                </motion.button>
              ))}

              {folders.length === 0 && (
                <div className="text-center py-8">
                  <FolderOpen className="size-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">
                    No folders yet. Create one to organize your files!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
