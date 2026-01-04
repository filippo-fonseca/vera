'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee, PendingInvite } from '@/lib/types';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { EmployeeTable } from './components/EmployeeTable';
import { AddEmployeeModal } from './components/AddEmployeeModal';

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

      <EmployeeTable
        employees={employees}
        pendingInvites={pendingInvites}
        onDelete={handleDeleteEmployee}
      />

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleAddEmployee}
        saving={saving}
        error={error}
      />
    </div>
  );
}
