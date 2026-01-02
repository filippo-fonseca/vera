"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, FileText, Award, MessageSquare, ClipboardCheck } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Student Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome to your learning hub. Track your progress and stay organized.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <BookOpen className="size-6 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">My Courses</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="size-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="size-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Schedule</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Award className="size-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Grades</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <MessageSquare className="size-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <ClipboardCheck className="size-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Student Features Coming Soon
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Course enrollment and material access
            </li>
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Assignment submission and tracking
            </li>
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Grade viewing and progress reports
            </li>
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Communication with teachers
            </li>
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Personal schedule and calendar
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
