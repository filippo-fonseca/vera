'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CustomButton from '@/components/common/CustomButton/CustomButton';
import Sidebar from '@/components/dashboard/Sidebar';
import Particles from '@/components/landing/Particles';
import { Bell, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <Particles
          className="absolute inset-0"
          quantity={3000}
          ease={80}
          color={"#ec489920"}
          refresh
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-sm font-medium text-gray-400 z-10"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden relative">
      <Particles
        className="absolute inset-0 z-0"
        quantity={3000}
        ease={80}
        color={"#ec489915"}
        refresh
      />

      {/* Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-sm mt-3 mx-3 rounded-xl p-4 flex justify-between items-center border border-gray-200/50 shadow-lg z-10"
      >
        <div className="flex items-center justify-left cursor-pointer gap-3 border border-gray-200/50 p-2.5 rounded-lg shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-center gap-2">
            <div className="size-6 rounded-md bg-pink-500 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-bold text-base text-black">
              Vera
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6">
          <CustomButton
            onClick={() => {
              signOut();
            }}
            isInverse
          >
            Sign out
          </CustomButton>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell
              size={20}
              className="stroke-gray-600 hover:stroke-pink-500 cursor-pointer transition-colors"
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="size-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer"
          >
            {user.firstName?.[0] || user.email?.[0]}
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3 z-10">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-shrink-0"
        >
          <Sidebar />
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
