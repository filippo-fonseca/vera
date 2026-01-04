"use client";

import { motion } from "framer-motion";
import { Home, Plus } from "lucide-react";
import StreamPost from "@/components/classroom/StreamPost";
import { Post, Assignment } from "@/lib/types";

interface StreamTabProps {
  posts: Post[];
  assignments: Assignment[];
  onAssignmentClick: (assignment: Assignment) => void;
  canEdit?: boolean;
}

export default function StreamTab({
  posts,
  assignments,
  onAssignmentClick,
  canEdit = false,
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
      {/* Header - no create button for students */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900">Class Stream</h2>
      </div>

      {/* Stream */}
      {posts.length === 0 ? (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center shadow-lg">
          <Home className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 font-medium">
            Your teacher hasn't posted anything yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => {
            const relatedAssignment = post.assignmentId
              ? assignments.find((a) => a.id === post.assignmentId)
              : undefined;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <StreamPost
                  post={post}
                  assignment={relatedAssignment}
                  onEdit={() => {}} // Students can't edit
                  onDelete={() => {}} // Students can't delete
                  onAssignmentClick={onAssignmentClick}
                  canEdit={false}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
