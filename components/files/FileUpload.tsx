"use client";

import { useRef } from "react";
import { Upload, X, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatFileSize } from "@/lib/storage";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export default function FileUpload({
  files,
  onFilesChange,
  multiple = true,
  accept,
  maxSize = 50, // 50MB default
  disabled = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Filter files by max size
    const validFiles = selectedFiles.filter((file) => {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        alert(`${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return false;
      }
      return true;
    });

    if (multiple) {
      onFilesChange([...files, ...validFiles]);
    } else {
      onFilesChange(validFiles.slice(0, 1));
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={disabled}
        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-400 hover:bg-pink-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="size-12 rounded-full bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center transition-colors">
            <Upload className="size-6 text-pink-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-1">
              {multiple ? "Upload Files" : "Upload File"}
            </p>
            <p className="text-xs text-gray-500">
              Click to browse • Max {maxSize}MB per file
            </p>
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl"
              >
                <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <File className="size-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="size-4 text-gray-400 hover:text-red-500" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
