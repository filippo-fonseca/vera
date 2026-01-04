"use client";

import { motion } from "framer-motion";
import {
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Megaphone,
  BookOpen,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Post, Assignment } from "@/lib/types";
import FileCard from "@/components/files/FileCard";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface StreamPostProps {
  post: Post;
  assignment?: Assignment;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssignmentClick?: () => void;
  canEdit?: boolean;
}

export default function StreamPost({
  post,
  assignment,
  onEdit,
  onDelete,
  onAssignmentClick,
  canEdit = false,
}: StreamPostProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [authorPhotoURL, setAuthorPhotoURL] = useState<string | undefined>(post.authorPhotoURL);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch author's photo if not present in post
  useEffect(() => {
    const fetchAuthorPhoto = async () => {
      if (!post.authorPhotoURL && post.authorId) {
        try {
          const userDoc = await getDoc(doc(db, "users", post.authorId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.photoURL) {
              setAuthorPhotoURL(userData.photoURL);
            }
          }
        } catch (error) {
          console.error("Error fetching author photo:", error);
        }
      }
    };

    fetchAuthorPhoto();
  }, [post.authorId, post.authorPhotoURL]);

  const getPostIcon = () => {
    switch (post.type) {
      case "assignment":
        return <FileText className="size-4 text-white" />;
      case "material":
        return <BookOpen className="size-4 text-white" />;
      case "announcement":
      default:
        return <Megaphone className="size-4 text-white" />;
    }
  };

  const getPostTypeColor = () => {
    switch (post.type) {
      case "assignment":
        return "from-purple-500 to-purple-600";
      case "material":
        return "from-blue-500 to-blue-600";
      case "announcement":
      default:
        return "from-pink-500 to-pink-600";
    }
  };

  const getPostTypeBadge = () => {
    switch (post.type) {
      case "assignment":
        return "bg-purple-100 text-purple-700";
      case "material":
        return "bg-blue-100 text-blue-700";
      case "announcement":
      default:
        return "bg-pink-100 text-pink-700";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  };

  const getAuthorInitials = () => {
    const names = post.authorName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return post.authorName.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Timeline Line */}
      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-transparent" />

      {/* Post Card */}
      <div className="relative bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all mb-6">
        {/* Author Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Author Profile Picture */}
            <div className="relative">
              {authorPhotoURL ? (
                <img
                  src={authorPhotoURL}
                  alt={post.authorName}
                  className="size-12 rounded-full object-cover border-2 border-gray-200 shadow-md"
                />
              ) : (
                <div className="size-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center border-2 border-gray-200 shadow-md">
                  <span className="text-white font-black text-sm">
                    {getAuthorInitials()}
                  </span>
                </div>
              )}
              {/* Post Type Badge - overlaid on profile pic */}
              <div
                className={`absolute -bottom-1 -right-1 size-6 rounded-full bg-gradient-to-br ${getPostTypeColor()} flex items-center justify-center shadow-lg border-2 border-white`}
              >
                {getPostIcon()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-black text-gray-900">{post.authorName}</h4>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide ${getPostTypeBadge()}`}
                >
                  {post.type}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Menu */}
          {canEdit && (
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="size-4 text-gray-600" />
              </motion.button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50"
                >
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                    >
                      <Edit className="size-4 text-blue-600" />
                      <span className="text-sm font-bold text-gray-700">
                        Edit
                      </span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 className="size-4 text-red-600" />
                      <span className="text-sm font-bold text-red-600">
                        Delete
                      </span>
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="ml-15 space-y-4">
          <p className="text-gray-700 font-medium whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Assignment Info */}
          {post.type === "assignment" && assignment && (
            <div
              onClick={onAssignmentClick}
              className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-100 rounded-xl cursor-pointer hover:border-purple-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-black text-gray-900 mb-1">
                    {assignment.title}
                  </h5>
                  {assignment.description && (
                    <p className="text-sm font-medium text-gray-600">
                      {assignment.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-semibold">
                {assignment.dueDate && (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg">
                    <Calendar className="size-4 text-purple-600" />
                    <span className="text-purple-700">
                      Due {assignment.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                )}
                {assignment.points && (
                  <div className="bg-white px-3 py-1.5 rounded-lg text-green-700">
                    {assignment.points} points
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Attachments ({post.attachments.length})
              </h4>
              <div className="space-y-2">
                {post.attachments.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    compact
                    showActions={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
