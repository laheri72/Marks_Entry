// Storage Service for The Register
// Primary Source of Truth: Firebase Cloud Firestore (ajs-marks-app-2026) with Local Cache Fallback

import { db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEYS = {
  TEACHERS: 'tr_teachers_v2',
  STDS: 'tr_stds_v2',
  SUBJECTS: 'tr_subjects_v2',
  STUDENTS: 'tr_students_v2',
  MAX_MARKS: 'tr_max_marks_v2',
  MARKS: 'tr_marks_v2'
};

export const storageService = {
  // Read Data: Queries Realtime Cloud Firestore first, falls back to Local Cache
  async get(key, fallback = null) {
    try {
      const docRef = doc(db, "register_data", key);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data()?.payload;
        if (cloudData !== undefined && cloudData !== null) {
          try { localStorage.setItem(key, JSON.stringify(cloudData)); } catch(e) {}
          return cloudData;
        }
      }
    } catch (cloudErr) {
      console.warn(`[Firestore Cloud Note] '${key}':`, cloudErr.message);
    }

    // Local Storage Cache Fallback if offline
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  // Write Data: Immediate Local Storage cache update + Real-Time Cloud Firestore Sync
  async set(key, value) {
    // 1. Immediate Local Storage Cache
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Local storage error:", e);
    }

    // 2. Real-Time Cloud Firestore Sync across all devices
    try {
      const docRef = doc(db, "register_data", key);
      await setDoc(docRef, {
        payload: value,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (cloudErr) {
      console.warn(`[Firestore Sync Note] Could not write '${key}' to Cloud DB:`, cloudErr.message);
    }
  },

  // Real-Time Cloud Subscription Listener: Instantly updates all devices when any teacher enters marks
  subscribeToKey(key, callback) {
    try {
      const docRef = doc(db, "register_data", key);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data()?.payload;
          if (cloudData !== undefined && cloudData !== null) {
            callback(cloudData);
          }
        }
      }, (err) => {
        console.warn(`[Firestore Listener Note] '${key}':`, err.message);
      });
    } catch (e) {
      return () => {};
    }
  }
};

export { STORAGE_KEYS };
