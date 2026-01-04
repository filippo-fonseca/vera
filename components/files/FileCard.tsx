"use client";

import { motion } from "framer-motion";
import {
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Trash2,
  ExternalLink,
  FolderInput,
} from "lucide-react";
import { FileAttachment } from "@/lib/types";
import {
  formatFileSize,
  getFileExtension,
  getFileExtensionColor,
} from "@/lib/storage";

interface FileCardProps {
  file: FileAttachment;
  onDelete?: () => void;
  onDownload?: () => void;
  onMove?: () => void;
  showActions?: boolean;
  compact?: boolean;
  mini?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const getFileIcon = (extension: string) => {
  const ext = extension.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return Image;
  }
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
    return Video;
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
    return Music;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return Archive;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    return FileText;
  }

  return File;
};

export default function FileCard({
  file,
  onDelete,
  onDownload,
  onMove,
  showActions = true,
  compact = false,
  mini = false,
  draggable = false,
  onDragStart,
}: FileCardProps) {
  const extension = getFileExtension(file.name);
  const colors = getFileExtensionColor(extension);
  const Icon = getFileIcon(extension);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      window.open(file.url, '_blank');
    }
  };

  if (mini) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2 }}
        draggable={draggable}
        onDragStart={onDragStart}
        className="bg-white border-2 border-gray-100 rounded-xl p-3 hover:border-gray-200 hover:shadow-lg transition-all group cursor-move"
      >
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`size-5 ${colors.text}`} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{file.name}</p>
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 ${colors.bg} ${colors.text} text-xs font-bold rounded uppercase`}>
                {extension || 'file'}
              </span>
              <span className="text-xs font-medium text-gray-500">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onMove && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onMove}
                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Move to folder"
                >
                  <FolderInput className="size-3.5 text-blue-600" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDownload}
                className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="size-3.5 text-green-600" />
              </motion.button>
              {onDelete && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDelete}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="size-3.5 text-red-600" />
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-all group"
      >
        <div className={`size-10 rounded-lg ${colors.bg} border-2 ${colors.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`size-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="size-4 text-blue-600" />
            </motion.button>
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="size-4 text-red-600" />
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-xl transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className={`size-14 rounded-xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className={`size-7 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-base truncate mb-1">
                {file.name}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 ${colors.bg} ${colors.text} border ${colors.border} text-xs font-bold rounded-lg uppercase tracking-wide`}>
                  {extension || 'file'}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>
          </div>

          {file.uploadedAt && (
            <p className="text-xs text-gray-500 font-medium">
              Uploaded {file.uploadedAt.toLocaleDateString()} at{' '}
              {file.uploadedAt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Download className="size-4" />
            Download
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(file.url, '_blank')}
            className="px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="size-4" />
            Open
          </motion.button>
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="px-4 py-2.5 bg-white border-2 border-red-200 hover:border-red-300 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="size-4" />
              Delete
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
