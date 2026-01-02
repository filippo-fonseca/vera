'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err.message || 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const schoolId = `school_${userId}`;

      console.log('Created auth user:', userId);

      // Create minimal school document (will be filled in during onboarding)
      await setDoc(doc(db, 'schools', schoolId), {
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('School document created');

      // Create admin user document (minimal info)
      await setDoc(doc(db, 'users', userId), {
        email: email,
        firstName: '',
        lastName: '',
        role: 'admin',
        schoolId: schoolId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('User document created');

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err: any) {
      console.error('Sign up error:', err);
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered'
        : err.code === 'permission-denied'
        ? 'Database permission error. Check Firestore security rules.'
        : err.message || 'Failed to create account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">
            Vera
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Modern Learning Management
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all ${
                !isSignUp
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all ${
                isSignUp
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="admin@school.edu"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label htmlFor="signupEmail" className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  id="signupEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="admin@school.edu"
                />
              </div>

              <div>
                <label htmlFor="signupPassword" className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  id="signupPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
