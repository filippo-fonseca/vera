"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Loader2, User as UserIcon } from "lucide-react";
import { User } from "@/lib/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { TextArea } from "./Form";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  user,
  isOpen,
  onClose,
}: UserProfileModalProps) {
  const { refreshUser } = useAuth();
  const [description, setDescription] = useState(user.description || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploading(true);

    try {
      const updates: any = {
        description,
        updatedAt: new Date(),
      };

      // Upload photo if selected
      if (photoFile) {
        const timestamp = Date.now();
        const photoPath = `users/${user.id}/profile_${timestamp}.jpg`;
        const storageRef = ref(storage, photoPath);

        await uploadBytes(storageRef, photoFile);
        const photoURL = await getDownloadURL(storageRef);
        updates.photoURL = photoURL;
      }

      // Update user document
      await updateDoc(doc(db, "users", user.id), updates);

      // Refresh user data in AuthContext
      await refreshUser();

      // Reset states
      setPhotoFile(null);
      setPhotoPreview(null);

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const getUserInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10001] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border-2 border-gray-100"
          >
            {/* Header */}
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Edit Profile</h2>
                <p className="text-sm font-medium text-gray-600 mt-1">
                  Customize your profile picture and description
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={saving}
                className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X className="size-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-6">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="size-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    />
                  ) : user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="size-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    />
                  ) : (
                    <div className="size-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                      <span className="text-white font-black text-3xl">
                        {getUserInitials()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        disabled={saving}
                        className="hidden"
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="size-4" />
                        Change Photo
                      </motion.div>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info (Read-only) */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-3">
                  <UserIcon className="size-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Name
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <UserIcon className="size-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Email
                    </p>
                    <p className="text-sm font-bold text-gray-900">{user.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">
                  Name and email can only be changed by administrators
                </p>
              </div>

              {/* Description */}
              <div>
                <TextArea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell us a bit about yourself..."
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {description.length}/500 characters
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t-2 border-gray-100 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-white hover:border-gray-300 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="size-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    {uploading ? "Uploading..." : "Saving..."}
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
