// Storage Service for The Register
// Local Session Isolation & Granular Cloud Firestore Database Sync

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

// Helper: Sanitize document IDs for Firestore
const sanitizeDocId = (id) => String(id).replace(/[\/\s()]/g, '_');

export const storageService = {
  // Read Data: Device Session keys read strictly from Local Device Storage
  async get(key, fallback = null) {
    // 1. Device Local Sessions (MUST NOT sync to shared Cloud DB)
    if (key === 'tr_active_session') {
      try {
        const val = sessionStorage.getItem(key) || localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    // 2. School Master Shared Keys (Try Cloud Firestore first)
    try {
      const cleanKey = sanitizeDocId(key);
      const docRef = doc(db, "school_master", cleanKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data()?.payload;
        if (cloudData !== undefined && cloudData !== null) {
          try { localStorage.setItem(key, JSON.stringify(cloudData)); } catch(e) {}
          return cloudData;
        }
      }
    } catch (cloudErr) {
      console.warn(`[Firestore Read Note] '${key}':`, cloudErr.message);
    }

    // LocalStorage Fallback
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  // Write Data: Device Sessions write ONLY to local device memory
  async set(key, value) {
    if (key === 'tr_active_session') {
      try {
        if (value) {
          sessionStorage.setItem(key, JSON.stringify(value));
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        }
      } catch (e) {}
      return;
    }

    // Save Master Keys to LocalStorage cache + Cloud Firestore DB
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}

    try {
      const cleanKey = sanitizeDocId(key);
      const docRef = doc(db, "school_master", cleanKey);
      await setDoc(docRef, {
        payload: value,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (cloudErr) {
      console.error(`[Firestore Master Write Error] '${key}':`, cloudErr.message);
    }
  },

  // Save Marks Roster for specific Class + Subject (Granular Cloud Document)
  async saveClassSubjectMarks(std, subject, marksMapKeyObj, teacher) {
    const docId = sanitizeDocId(`${std}_${subject}`);
    
    // 1. Update Local Storage cache
    try {
      const allMarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '{}');
      allMarks[`${std}|${subject}`] = marksMapKeyObj;
      localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(allMarks));
    } catch (e) {}

    // 2. Write to Granular Cloud Firestore Document
    try {
      const docRef = doc(db, "marks_rosters", docId);
      await setDoc(docRef, {
        std,
        subject,
        marks: marksMapKeyObj,
        updatedBy: teacher?.name || teacher?.email || 'Teacher',
        updatedAt: Date.now()
      }, { merge: true });

      // Also update master marks summary doc
      const masterMarksRef = doc(db, "school_master", STORAGE_KEYS.MARKS);
      const masterSnap = await getDoc(masterMarksRef);
      const masterData = masterSnap.exists() ? (masterSnap.data()?.payload || {}) : {};
      masterData[`${std}|${subject}`] = marksMapKeyObj;
      await setDoc(masterMarksRef, { payload: masterData, updatedAt: Date.now() }, { merge: true });

    } catch (cloudErr) {
      console.error(`[Firestore Roster Write Error] '${std} ${subject}':`, cloudErr.message);
      throw cloudErr;
    }
  },

  // Subscribe to Real-Time Cloud Updates for a Specific Class + Subject Roster
  subscribeToRoster(std, subject, callback) {
    if (!std || !subject) return () => {};
    const docId = sanitizeDocId(`${std}_${subject}`);

    try {
      const docRef = doc(db, "marks_rosters", docId);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()?.marks;
          if (data !== undefined && data !== null) {
            callback(data);
          }
        }
      }, (err) => {
        console.warn(`[Firestore Roster Listener Error] '${docId}':`, err.message);
      });
    } catch (e) {
      return () => {};
    }
  },

  // Subscribe to Master Keys
  subscribeToKey(key, callback) {
    if (key === 'tr_active_session') return () => {};
    const cleanKey = sanitizeDocId(key);
    try {
      const docRef = doc(db, "school_master", cleanKey);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data()?.payload;
          if (cloudData !== undefined && cloudData !== null) {
            callback(cloudData);
          }
        }
      }, (err) => {
        console.warn(`[Firestore Master Listener Error] '${key}':`, err.message);
      });
    } catch (e) {
      return () => {};
    }
  }
};

export { STORAGE_KEYS };
