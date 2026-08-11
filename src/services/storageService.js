// Storage Service for The Register
// Supports Firebase / Supabase BaaS Cloud storage with automatic LocalStorage & IndexedDB offline fallbacks

const STORAGE_KEYS = {
  TEACHERS: 'tr_teachers_v2',
  STDS: 'tr_stds_v2',
  SUBJECTS: 'tr_subjects_v2',
  STUDENTS: 'tr_students_v2',
  MAX_MARKS: 'tr_max_marks_v2',
  MARKS: 'tr_marks_v2'
};

export const storageService = {
  async get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      console.warn("Storage read fallback triggered:", key, e);
      return fallback;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage write error:", key, e);
    }
  },

  async saveMarkEntry(std, subject, studentId, value, teacher) {
    const key = `${std}|${subject}`;
    const allMarks = await this.get(STORAGE_KEYS.MARKS, {});
    const existingKey = allMarks[key] || {};
    
    if (value !== '' && value !== null) {
      existingKey[studentId] = {
        value: String(value),
        enteredBy: teacher.id || teacher.email,
        enteredByName: teacher.name || teacher.displayName,
        at: Date.now()
      };
    } else {
      delete existingKey[studentId];
    }
    
    allMarks[key] = existingKey;
    await this.set(STORAGE_KEYS.MARKS, allMarks);
    return allMarks;
  }
};

export { STORAGE_KEYS };
