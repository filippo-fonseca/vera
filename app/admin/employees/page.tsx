'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee, PendingInvite } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Mail, Shield, Clock, CheckCircle } from 'lucide-react';
import Modal from '@/components/common/Modal/Modal';

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'teacher' as 'admin' | 'teacher',
    department: '',
    title: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    if (!user?.schoolId) return;

    try {
      // Fetch active employees
      const q = query(
        collection(db, 'users'),
        where('schoolId', '==', user.schoolId),
        where('role', 'in', ['admin', 'teacher'])
      );
      const snapshot = await getDocs(q);
      const employeesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Employee[];
      setEmployees(employeesData);

      // Fetch pending invites
      const invitesQuery = query(
        collection(db, 'pending-invites'),
        where('schoolId', '==', user.schoolId),
        where('role', 'in', ['admin', 'teacher']),
        where('status', '==', 'pending')
      );
      const invitesSnapshot = await getDocs(invitesQuery);
      const invitesData = invitesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as PendingInvite[];
      setPendingInvites(invitesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user?.schoolId]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.schoolId || !user?.id) return;

    setSaving(true);
    setError('');

    try {
      // Check if email already exists in users or pending invites
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', formData.email.toLowerCase())
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        setError('This email is already registered');
        setSaving(false);
        return;
      }

      const invitesQuery = query(
        collection(db, 'pending-invites'),
        where('email', '==', formData.email.toLowerCase()),
        where('status', '==', 'pending')
      );
      const invitesSnapshot = await getDocs(invitesQuery);

      if (!invitesSnapshot.empty) {
        setError('An invite has already been sent to this email');
        setSaving(false);
        return;
      }

      // Create pending invite
      await addDoc(collection(db, 'pending-invites'), {
        email: formData.email.toLowerCase(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        schoolId: user.schoolId,
        department: formData.department,
        title: formData.title,
        invitedBy: user.id,
        createdAt: new Date(),
        status: 'pending',
      });

      setShowAddModal(false);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'teacher',
        department: '',
        title: '',
      });
      fetchEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const isPendingInvite = pendingInvites.some(invite => invite.id === id);
    const confirmMessage = isPendingInvite
      ? 'Are you sure you want to cancel this invite?'
      : 'Are you sure you want to delete this employee?';

    if (!confirm(confirmMessage)) return;

    try {
      const collection = isPendingInvite ? 'pending-invites' : 'users';
      await deleteDoc(doc(db, collection, id));
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-gray-400"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Employees
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Manage teachers and administrators
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add Employee
        </motion.button>
      </motion.div>

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
                {['Name', 'Email', 'Role', 'Department', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
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
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No employees found. Invite your first employee to get started.
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
                              {invite.firstName?.[0]}{invite.lastName?.[0]}
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
                          <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${
                            invite.role === 'admin'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            <Shield size={12} />
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invite.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteEmployee(invite.id)}
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
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
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
                        <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${
                          employee.role === 'admin'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Shield size={12} />
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {employee.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteEmployee(employee.id)}
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

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Employee"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              placeholder="employee@school.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Department (optional)
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              placeholder="Mathematics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title (optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              placeholder="Senior Teacher"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'teacher' })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              type="button"
              onClick={() => setShowAddModal(false)}
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
              {saving ? 'Sending Invite...' : 'Send Invite'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
