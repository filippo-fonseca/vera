import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCqwO_t96OVhmUfbf-U3T1V-nAj0H7eLVU',
  authDomain: 'better-bac.firebaseapp.com',
  projectId: 'better-bac',
  storageBucket: 'better-bac.appspot.com',
  messagingSenderId: '463962963891',
  appId: '1:463962963891:web:72d49bfc479a7bfb2815c6',
  measurementId: 'G-BTVW3VBVM8',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
