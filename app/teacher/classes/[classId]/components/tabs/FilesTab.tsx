"use client";

import { motion } from "framer-motion";
import {
  Upload,
  FolderPlus,
  FolderOpen,
  ArrowLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import FileCard from "@/components/files/FileCard";

interface FilesTabProps {
  classFiles: any[];
  classFolders: any[];
  currentFolderId: string | null;
  draggedFileId: string | null;
  dragOverFolderId: string | null;
  onUploadFiles: () => void;
  onCreateFolder: () => void;
  onBackToRoot: () => void;
  onFolderClick: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onFileDragStart: (fileId: string) => void;
  onFolderDragOver: (e: React.DragEvent, folderId: string | null) => void;
  onFolderDrop: (e: React.DragEvent, folderId: string | null) => void;
  onFileMove: (file: any) => void;
  onFileDelete: (fileId: string) => void;
  isReadOnly?: boolean;
}

export default function FilesTab({
  classFiles,
  classFolders,
  currentFolderId,
  draggedFileId,
  dragOverFolderId,
  onUploadFiles,
  onCreateFolder,
  onBackToRoot,
  onFolderClick,
  onDeleteFolder,
  onFileDragStart,
  onFolderDragOver,
  onFolderDrop,
  onFileMove,
  onFileDelete,
  isReadOnly = false,
}: FilesTabProps) {
  return (
    <motion.div
      key="files"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with breadcrumb and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            onDragOver={(e) => onFolderDragOver(e, null)}
            onDrop={(e) => onFolderDrop(e, null)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dragOverFolderId === null && draggedFileId
                ? "bg-blue-100 border-2 border-blue-400"
                : "hover:bg-gray-100"
            }`}
          >
            <h2 className="text-3xl font-black text-gray-900">Files</h2>
          </div>
          {currentFolderId && (
            <>
              <ChevronRight className="size-5 text-gray-400" />
              <span className="text-xl font-bold text-gray-600">
                {classFolders.find((f: any) => f.id === currentFolderId)?.name}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentFolderId && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToRoot}
              className="px-3.5 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </motion.button>
          )}
          {!isReadOnly && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateFolder}
                className="px-3.5 py-2 bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-700 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <FolderPlus className="size-3.5" />
                New Folder
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUploadFiles}
                className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Upload className="size-3.5" />
                Upload Files
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Folders */}
      {classFolders.filter((f: any) => (f.parentId || null) === currentFolderId).length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
            Folders
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {classFolders
              .filter((f: any) => (f.parentId || null) === currentFolderId)
              .map((folder: any, index: number) => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onFolderClick(folder.id)}
                  onDragOver={(e) => onFolderDragOver(e, folder.id)}
                  onDrop={(e) => onFolderDrop(e, folder.id)}
                  className={`bg-white border-2 rounded-2xl p-5 hover:shadow-xl transition-all group relative ${
                    dragOverFolderId === folder.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="size-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mb-3">
                        <FolderOpen className="size-7 text-white" />
                      </div>
                      <p className="font-black text-gray-900 truncate">
                        {folder.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        {classFiles.filter((f: any) => (f.folderId || null) === folder.id).length} files
                      </p>
                    </div>
                    {!isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
          Files ({classFiles.filter((f: any) => (f.folderId || null) === currentFolderId).length})
        </h3>
        {classFiles.filter((f: any) => (f.folderId || null) === currentFolderId).length === 0 ? (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center shadow-lg">
            <FolderOpen className="size-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 mb-2">
              No files yet
            </h3>
            <p className="text-gray-600 font-medium mb-6">
              {isReadOnly ? "No files available yet" : "Upload files to share with your class"}
            </p>
            {!isReadOnly && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUploadFiles}
                className="px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all inline-flex items-center gap-2"
              >
                <Upload className="size-4" />
                Upload Files
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {classFiles
              .filter((f: any) => (f.folderId || null) === currentFolderId)
              .map((file: any) => (
                <FileCard
                  key={file.id}
                  file={{
                    id: file.id,
                    name: file.name,
                    url: file.url,
                    size: file.size,
                    type: file.type,
                    uploadedBy: file.uploadedBy,
                    uploadedAt: file.uploadedAt,
                  }}
                  mini
                  draggable={!isReadOnly}
                  onDragStart={() => !isReadOnly && onFileDragStart(file.id)}
                  onMove={() => !isReadOnly && onFileMove(file)}
                  onDelete={() => !isReadOnly && onFileDelete(file.id)}
                  showActions={!isReadOnly}
                />
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
