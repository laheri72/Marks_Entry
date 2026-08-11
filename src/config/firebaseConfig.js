import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration (Uses Environment variables or Cloud Defaults)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForRegistrationApp2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "the-register-marks.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "the-register-marks",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "the-register-marks.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987654321012:web:abcdef123456"
};

// Initialize Firebase Instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Real Google OAuth Sign-In Popup Helper
export const signInWithGoogleCloud = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL,
      role: 'teacher'
    };
  } catch (error) {
    console.warn("Firebase Google Auth popup closed or unconfigured. Prompting institutional email:", error.message);
    throw error;
  }
};

export const signOutCloud = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.error("Sign out error", e);
  }
};
