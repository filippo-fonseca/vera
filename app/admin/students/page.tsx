'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Student, PendingInvite } from '@/lib/types';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { StudentTable } from './components/StudentTable';
import { AddStudentModal } from './components/AddStudentModal';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    gradeLevel: '',
    studentId: '',
    guardianEmail: '',
    guardianPhone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    if (!user?.schoolId) return;

    try {
      // Fetch active students
      const q = query(
        collection(db, 'users'),
        where('schoolId', '==', user.schoolId),
        where('role', '==', 'student')
      );
      const snapshot = await getDocs(q);
      const studentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Student[];
      setStudents(studentsData);

      // Fetch pending invites
      const invitesQuery = query(
        collection(db, 'pending-invites'),
        where('schoolId', '==', user.schoolId),
        where('role', '==', 'student'),
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
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user?.schoolId]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.schoolId || !user?.id) return;

    setSaving(true);
    setError('');

    try {
      // Check if email already exists
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
        role: 'student',
        schoolId: user.schoolId,
        gradeLevel: formData.gradeLevel,
        studentId: formData.studentId,
        guardianEmail: formData.guardianEmail,
        guardianPhone: formData.guardianPhone,
        invitedBy: user.id,
        createdAt: new Date(),
        status: 'pending',
      });

      setShowAddModal(false);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        gradeLevel: '',
        studentId: '',
        guardianEmail: '',
        guardianPhone: '',
      });
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const isPendingInvite = pendingInvites.some(invite => invite.id === id);
    const confirmMessage = isPendingInvite
      ? 'Are you sure you want to cancel this invite?'
      : 'Are you sure you want to delete this student?';

    if (!confirm(confirmMessage)) return;

    try {
      const collectionName = isPendingInvite ? 'pending-invites' : 'users';
      await deleteDoc(doc(db, collectionName, id));
      fetchStudents();
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
          <h1 className="text-3xl font-bold text-black mb-2">Students</h1>
          <p className="text-sm font-medium text-gray-500">
            Manage student enrollment
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add Student
        </motion.button>
      </motion.div>

      <StudentTable
        students={students}
        pendingInvites={pendingInvites}
        onDelete={handleDeleteStudent}
      />

      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleAddStudent}
        saving={saving}
        error={error}
      />
    </div>
  );
}
