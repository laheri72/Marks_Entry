// Universal Cloud Storage Service for The Register
// Supports Netlify Database, Netlify Functions, Supabase, Firebase & LocalStorage cache

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

// Check Netlify DB / Custom Cloud Environment Variables
const NETLIFY_DB_URL = import.meta.env.VITE_NETLIFY_DB_URL || import.meta.env.VITE_DATABASE_URL || '';
const NETLIFY_DB_TOKEN = import.meta.env.VITE_NETLIFY_DB_TOKEN || '';

export const storageService = {
  // Read Data: Tries Netlify DB / Cloud Serverless first, then Firebase, then LocalStorage
  async get(key, fallback = null) {
    // 1. Try Netlify Database REST Endpoint or Netlify Serverless Function
    try {
      // Check if running on Netlify environment or custom Netlify DB URL
      const endpoint = NETLIFY_DB_URL
        ? `${NETLIFY_DB_URL}?key=${key}`
        : `/.netlify/functions/db-sync?key=${key}`;

      const headers = NETLIFY_DB_TOKEN ? { 'Authorization': `Bearer ${NETLIFY_DB_TOKEN}` } : {};
      const res = await fetch(endpoint, { headers });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.payload !== undefined && json.payload !== null) {
          try { localStorage.setItem(key, JSON.stringify(json.payload)); } catch(e) {}
          return json.payload;
        }
      }
    } catch (e) {
      // Netlify endpoint silent fallback
    }

    // 2. Try Firebase Cloud Firestore
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
      // Firebase silent fallback
    }

    // 3. LocalStorage Fallback
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  // Write Data: Immediate LocalStorage cache + Async Cloud DB sync (Netlify DB + Firebase)
  async set(key, value) {
    // 1. Save to LocalStorage immediately for zero-latency UI
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Local storage error:", e);
    }

    // 2. Write to Netlify DB / Netlify Serverless Cloud Function
    try {
      const endpoint = NETLIFY_DB_URL
        ? NETLIFY_DB_URL
        : `/.netlify/functions/db-sync`;

      const headers = {
        'Content-Type': 'application/json',
        ...(NETLIFY_DB_TOKEN ? { 'Authorization': `Bearer ${NETLIFY_DB_TOKEN}` } : {})
      };

      await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key, payload: value })
      });
    } catch (e) {
      // Netlify function write fallback
    }

    // 3. Write to Firebase Cloud Firestore
    try {
      const docRef = doc(db, "register_data", key);
      await setDoc(docRef, {
        payload: value,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (cloudErr) {
      // Firebase write fallback
    }
  },

  // Real-Time Cloud Subscription Listener
  subscribeToKey(key, callback) {
    // Poll Netlify Serverless DB every 8 seconds for multi-device sync
    const interval = setInterval(async () => {
      try {
        const data = await this.get(key, null);
        if (data !== null) {
          callback(data);
        }
      } catch (e) {}
    }, 8000);

    // Also attach Firebase Realtime Listener if available
    let unsubFirebase = () => {};
    try {
      const docRef = doc(db, "register_data", key);
      unsubFirebase = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data()?.payload;
          if (cloudData !== undefined && cloudData !== null) {
            callback(cloudData);
          }
        }
      }, () => {});
    } catch (e) {}

    return () => {
      clearInterval(interval);
      unsubFirebase();
    };
  }
};

export { STORAGE_KEYS };
