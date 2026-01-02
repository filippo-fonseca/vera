"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Calendar, FileText } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome to your teaching hub. Manage your classes and students.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-sm text-gray-600">My Classes</p>
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
                <Users className="size-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Students</p>
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
                <FileText className="size-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Teacher Features Coming Soon
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Class management and curriculum planning
            </li>
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Student roster and performance tracking
            </li>
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Assignment creation and grading
            </li>
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Communication with students and parents
            </li>
            <li className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-pink-500" />
              Attendance tracking and reporting
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
