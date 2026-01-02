'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, FormEvent, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { School } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle2, Upload, Image as ImageIcon } from 'lucide-react';

export default function SchoolSettings() {
  const { user } = useAuth();
  const [school, setSchool] = useState<Partial<School>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      if (!user?.schoolId) return;

      try {
        const schoolDoc = await getDoc(doc(db, 'schools', user.schoolId));
        if (schoolDoc.exists()) {
          setSchool(schoolDoc.data() as School);
        }
      } catch (error) {
        console.error('Error fetching school:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [user?.schoolId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.schoolId) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `schools/${user.schoolId}/logo`);
      await uploadBytes(storageRef, file);
      const logoUrl = await getDownloadURL(storageRef);

      setSchool({ ...school, logoUrl });
      setMessage('Logo uploaded! Remember to save changes.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.schoolId) return;

    setSaving(true);
    setMessage('');

    try {
      await setDoc(
        doc(db, 'schools', user.schoolId),
        {
          ...school,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      setMessage('Saved');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error saving school:', error);
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg h-full overflow-y-auto">
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
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black mb-2">
          School Settings
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Manage your school's branding and information
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Logo Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              School Logo
            </label>
            <div className="flex items-center gap-4">
              {school.logoUrl && (
                <div className="size-20 rounded-lg border-2 border-gray-200/50 bg-white p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={school.logoUrl}
                    alt="School logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="size-4 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      {school.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </>
                  )}
                </motion.button>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </motion.div>

          {/* Accent Color */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={school.accentColor || '#ec4899'}
                  onChange={(e) => setSchool({ ...school, accentColor: e.target.value })}
                  className="size-12 rounded-lg border-2 border-gray-200/50 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={school.accentColor || '#ec4899'}
                  onChange={(e) => setSchool({ ...school, accentColor: e.target.value })}
                  placeholder="#ec4899"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all hover:border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This color will be used throughout the platform
                </p>
              </div>
            </div>
          </motion.div>

          {/* School Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label htmlFor="name" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              School Name
            </label>
            <input
              id="name"
              type="text"
              value={school.name || ''}
              onChange={(e) => setSchool({ ...school, name: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-gray-200/50 rounded-lg bg-white/50 backdrop-blur-sm text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all hover:border-gray-300"
              placeholder="Lincoln High School"
            />
          </motion.div>

          {[
            { id: 'website', label: 'Website', type: 'url', placeholder: 'https://school.edu' },
            { id: 'email', label: 'School Email', type: 'email', placeholder: 'info@school.edu' },
            { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567' },
          ].map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <label htmlFor={field.id} className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                value={(school as any)[field.id] || ''}
                onChange={(e) => setSchool({ ...school, [field.id]: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-200/50 rounded-lg bg-white/50 backdrop-blur-sm text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all hover:border-gray-300"
                placeholder={field.placeholder}
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <label htmlFor="address" className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Address
            </label>
            <textarea
              id="address"
              value={school.address || ''}
              onChange={(e) => setSchool({ ...school, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-200/50 rounded-lg bg-white/50 backdrop-blur-sm text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none hover:border-gray-300"
              placeholder="123 School Street, City, State 12345"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-4"
        >
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-600">{message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.form>
    </div>
  );
}
