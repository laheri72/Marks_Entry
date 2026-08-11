import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (import.meta.env.VITE_FIREBASE_PROJECT_ID ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app` : undefined),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase Instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force Google Account Selector Prompt every time
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const db = getFirestore(app);

// Real Google OAuth Sign-In Popup with Redirect Fallback
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
    console.warn("Popup auth note:", error.code, error.message);
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/user-cancelled' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      // Fallback to OAuth Redirect mode for browsers blocking popups
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
};

// Check Google Redirect OAuth Result on page return
export const checkGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      return {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        role: 'teacher'
      };
    }
  } catch (e) {
    console.error("Redirect Result Error:", e);
  }
  return null;
};

export const signOutCloud = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.error("Sign out error", e);
  }
};
