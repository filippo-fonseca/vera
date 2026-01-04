"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Mail, Shield, Clock } from "lucide-react";
import { Employee, PendingInvite } from "@/lib/types";

interface EmployeeTableProps {
  employees: Employee[];
  pendingInvites: PendingInvite[];
  onDelete: (id: string) => void;
}

export function EmployeeTable({
  employees,
  pendingInvites,
  onDelete,
}: EmployeeTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-md overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/50">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              {["Name", "Email", "Role", "Department", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/30">
            <AnimatePresence>
              {employees.length === 0 && pendingInvites.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No employees found. Invite your first employee to get
                    started.
                  </td>
                </motion.tr>
              ) : (
                <>
                  {/* Pending Invites */}
                  {pendingInvites.map((invite, index) => (
                    <motion.tr
                      key={`invite-${invite.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-yellow-50/30 hover:to-orange-50/30 transition-all bg-yellow-50/20"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm shadow-md">
                            {invite.firstName?.[0]}
                            {invite.lastName?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invite.firstName} {invite.lastName}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-yellow-600">
                              <Clock size={12} />
                              Pending invitation
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {invite.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${
                            invite.role === "admin"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <Shield size={12} />
                          {invite.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invite.department || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(invite.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 size={14} />
                          Cancel
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}

                  {/* Active Employees */}
                  {employees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-purple-50/30 transition-all"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {employee.firstName?.[0]}
                            {employee.lastName?.[0]}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {employee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${
                            employee.role === "admin"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <Shield size={12} />
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {employee.department || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(employee.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
