import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { FileAttachment } from './types';

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param classId - The class ID
 * @param folder - Optional folder path (e.g., 'assignments', 'posts', or custom folder)
 * @returns Promise with the file metadata
 */
export async function uploadFile(
  file: File,
  classId: string,
  uploadedBy: string,
  folder?: string
): Promise<FileAttachment> {
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = folder
    ? `classes/${classId}/${folder}/${timestamp}_${sanitizedFileName}`
    : `classes/${classId}/${timestamp}_${sanitizedFileName}`;

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  return {
    id: timestamp.toString(),
    name: file.name,
    url,
    size: file.size,
    type: file.type,
    uploadedBy,
    uploadedAt: new Date(),
  };
}

/**
 * Upload multiple files to Firebase Storage
 * @param files - Array of files to upload
 * @param classId - The class ID
 * @param folder - Optional folder path
 * @returns Promise with array of file metadata
 */
export async function uploadMultipleFiles(
  files: File[],
  classId: string,
  uploadedBy: string,
  folder?: string
): Promise<FileAttachment[]> {
  const uploadPromises = files.map((file) =>
    uploadFile(file, classId, uploadedBy, folder)
  );
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Firebase Storage
 * @param url - The file URL to delete
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Format file size to human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns The file extension (e.g., "pdf", "docx")
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Get color for file extension badge
 * @param extension - File extension
 * @returns Tailwind classes for background and text color
 */
export function getFileExtensionColor(extension: string): {
  bg: string;
  text: string;
  border: string;
} {
  const ext = extension.toLowerCase();

  // Documents
  if (['pdf'].includes(ext)) {
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  }
  if (['doc', 'docx'].includes(ext)) {
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
  }

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
  }

  // Code
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(ext)) {
    return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
  }

  // Video
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
    return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' };
  }

  // Audio
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
  }

  // Text
  if (['txt', 'md', 'json', 'xml'].includes(ext)) {
    return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }

  // Default
  return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
}
