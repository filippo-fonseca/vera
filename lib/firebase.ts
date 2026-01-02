import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCIAYBFVi6IBaHyIajpUVqk1mHcDg3LP2E",
  authDomain: "vera-ed.firebaseapp.com",
  projectId: "vera-ed",
  storageBucket: "vera-ed.firebasestorage.app",
  messagingSenderId: "240943476898",
  appId: "1:240943476898:web:0a7f9da18008cddf8aa7fb",
  measurementId: "G-WMX8NM7T79"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
