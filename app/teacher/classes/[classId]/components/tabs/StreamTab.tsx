"use client";

import { motion } from "framer-motion";
import { Plus, Home } from "lucide-react";
import { Post, Assignment } from "@/lib/types";
import StreamPost from "@/components/classroom/StreamPost";

interface StreamTabProps {
  posts: Post[];
  assignments: Assignment[];
  onCreatePost: () => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onAssignmentClick: (assignment: Assignment) => void;
}

export default function StreamTab({
  posts,
  assignments,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onAssignmentClick,
}: StreamTabProps) {
  return (
    <motion.div
      key="stream"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Create Post Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900">
          Class Stream
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreatePost}
          className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          Create Post
        </motion.button>
      </div>

      {/* Stream */}
      {posts.length === 0 ? (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center shadow-lg">
          <Home className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 font-medium mb-6">
            Share announcements, materials, and updates with your class
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreatePost}
            className="px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all inline-flex items-center gap-2"
          >
            <Plus className="size-4" />
            Create Your First Post
          </motion.button>
        </div>
      ) : (
        <div>
          {posts.map((post) => {
            const relatedAssignment = post.assignmentId
              ? assignments.find((a) => a.id === post.assignmentId)
              : undefined;

            return (
              <StreamPost
                key={post.id}
                post={post}
                assignment={relatedAssignment}
                canEdit={true}
                onEdit={() => onEditPost(post)}
                onDelete={() => onDeletePost(post.id)}
                onAssignmentClick={
                  relatedAssignment
                    ? () => onAssignmentClick(relatedAssignment)
                    : undefined
                }
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
