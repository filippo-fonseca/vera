"use client";

import { motion } from "framer-motion";
import Modal from "@/components/common/Modal/Modal";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    email: string;
    firstName: string;
    lastName: string;
    gradeLevel: string;
    studentId: string;
    guardianEmail: string;
    guardianPhone: string;
  };
  onFormDataChange: (data: AddStudentModalProps['formData']) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string;
}

export function AddStudentModal({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  onSubmit,
  saving,
  error,
}: AddStudentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Student">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                onFormDataChange({ ...formData, firstName: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                onFormDataChange({ ...formData, lastName: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              onFormDataChange({ ...formData, email: e.target.value })
            }
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
            placeholder="student@email.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Grade Level (optional)
            </label>
            <input
              type="text"
              value={formData.gradeLevel}
              onChange={(e) =>
                onFormDataChange({ ...formData, gradeLevel: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              placeholder="9th Grade"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Student ID (optional)
            </label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) =>
                onFormDataChange({ ...formData, studentId: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              placeholder="S12345"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Guardian Email (optional)
          </label>
          <input
            type="email"
            value={formData.guardianEmail}
            onChange={(e) =>
              onFormDataChange({ ...formData, guardianEmail: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
            placeholder="parent@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Guardian Phone (optional)
          </label>
          <input
            type="tel"
            value={formData.guardianPhone}
            onChange={(e) =>
              onFormDataChange({ ...formData, guardianPhone: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? "Sending Invite..." : "Send Invite"}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
