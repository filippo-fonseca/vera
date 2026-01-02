"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import LogoAppIcon from "@/components/icons/LogoAppIcon";
import Particles from "@/components/landing/Particles";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Users,
} from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState<"faculty" | "student">("faculty");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);

      // Fetch user data to determine role
      const userRef = doc(db, "users", auth.currentUser!.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        // Route based on user type selection and actual role
        if (userType === "faculty") {
          if (role === "admin") {
            router.push("/admin");
          } else if (role === "teacher") {
            router.push("/teacher");
          } else {
            setError(
              "You don't have faculty access. Please select 'Student' to continue."
            );
            setLoading(false);
            return;
          }
        } else {
          // Student login
          if (role === "student") {
            router.push("/student");
          } else {
            setError(
              "You don't have student access. Please select 'Faculty' to continue."
            );
            setLoading(false);
            return;
          }
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
          ? "Invalid email or password"
          : err.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : err.message || "Failed to sign in";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Check for pending invite
      const invitesQuery = query(
        collection(db, "pending-invites"),
        where("email", "==", email.toLowerCase()),
        where("status", "==", "pending")
      );
      const invitesSnapshot = await getDocs(invitesQuery);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      if (!invitesSnapshot.empty) {
        // User has a pending invite - use invite data
        const inviteDoc = invitesSnapshot.docs[0];
        const inviteData = inviteDoc.data();

        console.log("Found pending invite for:", email);

        // Build user data object, only including defined fields
        const userData: any = {
          email: email.toLowerCase(),
          firstName: inviteData.firstName,
          lastName: inviteData.lastName,
          role: inviteData.role,
          schoolId: inviteData.schoolId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add optional employee fields if they exist
        if (inviteData.department) userData.department = inviteData.department;
        if (inviteData.title) userData.title = inviteData.title;

        // Add optional student fields if they exist
        if (inviteData.gradeLevel) userData.gradeLevel = inviteData.gradeLevel;
        if (inviteData.studentId) userData.studentId = inviteData.studentId;
        if (inviteData.guardianEmail) userData.guardianEmail = inviteData.guardianEmail;
        if (inviteData.guardianPhone) userData.guardianPhone = inviteData.guardianPhone;

        // Create user with invite data
        await setDoc(doc(db, "users", userId), userData);

        // Delete the pending invite
        await deleteDoc(doc(db, "pending-invites", inviteDoc.id));

        console.log("User created from invite");

        // Route based on role
        if (inviteData.role === "admin") {
          router.push("/admin");
        } else if (inviteData.role === "teacher") {
          router.push("/teacher");
        } else if (inviteData.role === "student") {
          router.push("/student");
        }
      } else {
        // No invite - create new school admin account
        const schoolId = `school_${userId}`;

        console.log("Creating new school for:", email);

        // Create school document
        await setDoc(doc(db, "schools", schoolId), {
          name: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create admin user document
        await setDoc(doc(db, "users", userId), {
          email: email.toLowerCase(),
          firstName: "",
          lastName: "",
          role: "admin",
          schoolId: schoolId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log("New school admin created");
        router.push("/admin");
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      const errorMessage =
        err.code === "auth/email-already-in-use"
          ? "This email is already registered"
          : err.code === "permission-denied"
          ? "Database permission error. Check Firestore security rules."
          : err.message || "Failed to create account";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={3000}
        ease={80}
        color={"#ec489920"}
        refresh
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex flex-col items-center text-center gap-4"
        >
          <div className="size-16 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg border border-gray-200/50">
            <LogoAppIcon className="size-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-black mb-1 tracking-tight">
              Vera
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Modern learning management for humans.
            </p>
          </div>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-8"
        >
          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 text-center">
              I am a
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserType("faculty")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  userType === "faculty"
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Users
                    className={`size-6 ${
                      userType === "faculty" ? "text-pink-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      userType === "faculty" ? "text-pink-500" : "text-gray-600"
                    }`}
                  >
                    Faculty Member
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserType("student")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  userType === "student"
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <GraduationCap
                    className={`size-6 ${
                      userType === "student" ? "text-pink-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      userType === "student" ? "text-pink-500" : "text-gray-600"
                    }`}
                  >
                    Student
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                !isSignUp
                  ? "bg-white text-pink-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                isSignUp
                  ? "bg-white text-pink-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-red-50 border border-red-200/50 rounded-xl">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {!isSignUp ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignIn}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="admin@school.edu"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full mt-8 px-4 py-3.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignUp}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="signupEmail"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      id="signupEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="admin@school.edu"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signupPassword"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-xl bg-white text-black focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full mt-8 px-4 py-3.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <span>Creating account...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-500">
              Need to set up a new school?{" "}
              <a
                href="/setup"
                className="text-pink-500 hover:text-pink-600 font-semibold transition-colors"
              >
                Get Started
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
