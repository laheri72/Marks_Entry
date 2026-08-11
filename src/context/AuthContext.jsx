import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_DEMO_TEACHERS, SEED_STDS } from '../seedData';
import { storageService, STORAGE_KEYS } from '../services/storageService';
import { signInWithGoogleCloud, signOutCloud } from '../config/firebaseConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize Teachers & Restore Active Auth Session
  useEffect(() => {
    async function initAuth() {
      let savedTeachers = await storageService.get(STORAGE_KEYS.TEACHERS, null);
      if (!savedTeachers || savedTeachers.length === 0) {
        savedTeachers = DEFAULT_DEMO_TEACHERS;
        await storageService.set(STORAGE_KEYS.TEACHERS, savedTeachers);
      }
      setTeachers(savedTeachers);

      const activeSession = await storageService.get('tr_active_session', null);
      if (activeSession) {
        const found = savedTeachers.find(t => t.id === activeSession.id || t.email === activeSession.email);
        setCurrentUser(found || activeSession);
      } else {
        // Default to Demo Admin for instant test convenience
        setCurrentUser(savedTeachers[0]);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  // Update Teachers List in Storage & Active Session
  const updateTeachersList = async (updatedTeachers) => {
    setTeachers(updatedTeachers);
    await storageService.set(STORAGE_KEYS.TEACHERS, updatedTeachers);
    if (currentUser) {
      const refreshedUser = updatedTeachers.find(t => t.id === currentUser.id || t.email === currentUser.email);
      if (refreshedUser) setCurrentUser(refreshedUser);
    }
  };

  // Real Google OAuth Popup Sign-In Handler
  const loginWithGoogleOAuth = async () => {
    try {
      const gUser = await signInWithGoogleCloud();
      return await processGoogleUser(gUser);
    } catch (e) {
      // Fallback: Prompt for Google institutional email
      const email = prompt("Enter your institutional Google Account email:", "teacher.english@msb.edu");
      if (email) {
        return await processGoogleUser({
          email: email.trim(),
          name: email.split('@')[0].replace('.', ' ')
        });
      }
    }
  };

  // Custom Google Institutional Email Sign-In
  const processGoogleUser = async (googleUserObj) => {
    if (!googleUserObj || !googleUserObj.email) return;

    let existing = teachers.find(t => t.email.toLowerCase() === googleUserObj.email.toLowerCase());
    if (!existing) {
      // Provision new teacher profile for new Google account
      existing = {
        id: 't_g_' + Date.now(),
        email: googleUserObj.email,
        name: googleUserObj.name || googleUserObj.email.split('@')[0],
        role: 'teacher',
        photoURL: googleUserObj.photoURL || null,
        assignments: [] // Requires Admin assignment in Settings
      };
      const newList = [...teachers, existing];
      await updateTeachersList(newList);
    }
    setCurrentUser(existing);
    await storageService.set('tr_active_session', existing);
    return existing;
  };

  // Demo Account Switcher
  const loginAsDemo = async (teacherId) => {
    const found = teachers.find(t => t.id === teacherId);
    if (found) {
      setCurrentUser(found);
      await storageService.set('tr_active_session', found);
    }
  };

  const logout = async () => {
    await signOutCloud();
    setCurrentUser(null);
    await storageService.set('tr_active_session', null);
  };

  const isAdmin = currentUser?.role === 'admin';

  // Verification Helper: Is teacher assigned to Class + Subject?
  const isAssigned = (std, subject) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admin sees all
    const key = `${std}|${subject}`;
    return (currentUser.assignments || []).includes(key);
  };

  // Filtered List of Classes Assigned to Current User
  const getScopedStds = (allStds = SEED_STDS, subjectsByStd = {}) => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return allStds;

    const teacherAssignments = currentUser.assignments || [];
    return allStds.filter(std => {
      const stdSubjects = subjectsByStd[std] || [];
      return stdSubjects.some(sub => teacherAssignments.includes(`${std}|${sub}`));
    });
  };

  // Filtered List of Subjects Assigned to Current User for Selected Class
  const getScopedSubjects = (std, stdSubjects = []) => {
    if (!currentUser || !std) return [];
    if (currentUser.role === 'admin') return stdSubjects;

    const teacherAssignments = currentUser.assignments || [];
    return stdSubjects.filter(sub => teacherAssignments.includes(`${std}|${sub}`));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        teachers,
        loading,
        isAdmin,
        loginWithGoogleOAuth,
        processGoogleUser,
        loginAsDemo,
        logout,
        isAssigned,
        getScopedStds,
        getScopedSubjects,
        updateTeachersList
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
