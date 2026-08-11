// Storage Service for The Register
// Supports Real-Time Firebase Cloud Database Sync with LocalStorage Fallback for Zero Data Loss

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
  // Read Data: Tries Realtime Cloud DB first, falls back to LocalStorage cache
  async get(key, fallback = null) {
    try {
      // 1. Try reading from Firebase Cloud Firestore
      const docRef = doc(db, "register_data", key);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data()?.payload;
        if (cloudData !== undefined) {
          // Cache in local storage for offline resiliency
          try { localStorage.setItem(key, JSON.stringify(cloudData)); } catch(e) {}
          return cloudData;
        }
      }
    } catch (cloudErr) {
      console.warn(`[Cloud DB Note] Could not fetch '${key}' from Cloud Firestore (using Local Cache):`, cloudErr.message);
    }

    // 2. LocalStorage Fallback if Cloud DB fails or offline
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  // Write Data: Saves to LocalStorage IMMEDIATELY for instant UI speed, then syncs to Cloud DB
  async set(key, value) {
    // 1. Immediate LocalStorage Write
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
      console.warn(`[Cloud DB Note] Could not write '${key}' to Cloud Firestore:`, cloudErr.message);
    }
  },

  // Real-Time Listener: Listens for Cloud Database changes from other devices in real-time
  subscribeToKey(key, callback) {
    try {
      const docRef = doc(db, "register_data", key);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data()?.payload;
          if (cloudData !== undefined) {
            callback(cloudData);
          }
        }
      }, (err) => {
        console.warn(`[Cloud DB Listener Note] '${key}':`, err.message);
      });
    } catch (e) {
      return () => {};
    }
  }
};

export { STORAGE_KEYS };
