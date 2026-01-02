'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, GraduationCap, TrendingUp, University, User, BookOpen, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.schoolId) return;

      try {
        const employeesQuery = query(
          collection(db, 'users'),
          where('schoolId', '==', user.schoolId),
          where('role', 'in', ['admin', 'teacher'])
        );
        const studentsQuery = query(
          collection(db, 'users'),
          where('schoolId', '==', user.schoolId),
          where('role', '==', 'student')
        );

        const [employeesSnapshot, studentsSnapshot] = await Promise.all([
          getDocs(employeesQuery),
          getDocs(studentsQuery),
        ]);

        setStats({
          employees: employeesSnapshot.size,
          students: studentsSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.schoolId]);

  const statsCards = [
    {
      title: 'Employees',
      value: stats.employees,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Students',
      value: stats.students,
      icon: GraduationCap,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Total Users',
      value: stats.employees + stats.students,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  const quickActions = [
    {
      title: 'School Settings',
      description: 'Update branding and school details',
      icon: University,
      href: '/admin/school',
      color: 'bg-purple-500',
    },
    {
      title: 'Manage Employees',
      description: 'Add teachers and assign roles',
      icon: User,
      href: '/admin/employees',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Students',
      description: 'Add and manage student accounts',
      icon: BookOpen,
      href: '/admin/students',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black mb-2">
          Dashboard
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Welcome back, {user?.firstName || user?.email}
        </p>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-gray-400"
        >
          Loading...
        </motion.div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative overflow-hidden border border-gray-200/50 rounded-xl p-6 bg-white/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all group"
              >
                <div className={`absolute inset-0 ${stat.bgColor} opacity-30 group-hover:opacity-50 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {stat.title}
                    </div>
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <stat.icon size={18} className="text-white" />
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-4xl font-bold text-black"
                  >
                    {stat.value}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Link
                    href={action.href}
                    className="block relative overflow-hidden border border-gray-200/50 rounded-xl p-6 bg-white/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all group"
                  >
                    <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className={`inline-flex p-3 rounded-lg ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                        <action.icon size={24} className="text-white" />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-base font-bold text-black group-hover:text-pink-500 transition-colors">
                          {action.title}
                        </div>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="text-sm text-gray-500">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
