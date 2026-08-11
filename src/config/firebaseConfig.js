import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Real Production Firebase Configuration for ajs-marks-app-2026
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAIVGkahAPVpIbqOeQr5Z6jKa_cBxArWrY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ajs-marks-app-2026.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ajs-marks-app-2026",
  storageBucket: "ajs-marks-app-2026.firebasestorage.app",
  messagingSenderId: "988637153751",
  appId: "1:988637153751:web:1d4b718ce7639d3076e392"
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
