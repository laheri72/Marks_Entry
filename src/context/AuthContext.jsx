import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_DEMO_TEACHERS, SEED_STDS } from '../seedData';
import { storageService, STORAGE_KEYS } from '../services/storageService';
import { signInWithGoogleCloud, checkGoogleRedirectResult, signOutCloud } from '../config/firebaseConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState(null);

  // Initialize Teachers & Restore Active Auth Session
  useEffect(() => {
    async function initAuth() {
      let savedTeachers = await storageService.get(STORAGE_KEYS.TEACHERS, null);
      if (!savedTeachers || savedTeachers.length === 0) {
        savedTeachers = DEFAULT_DEMO_TEACHERS;
        await storageService.set(STORAGE_KEYS.TEACHERS, savedTeachers);
      }
      
      // Always ensure idrislaheri72@gmail.com is present as Primary Admin
      let hasAdmin = savedTeachers.some(t => t.email.toLowerCase() === 'idrislaheri72@gmail.com');
      if (!hasAdmin) {
        savedTeachers.unshift({
          id: 'admin_idris',
          email: 'idrislaheri72@gmail.com',
          name: 'Idris Laheri',
          role: 'admin',
          assignments: []
        });
        await storageService.set(STORAGE_KEYS.TEACHERS, savedTeachers);
      }

      setTeachers(savedTeachers);

      // Check if coming back from Google OAuth Redirect
      const redirectUser = await checkGoogleRedirectResult();
      if (redirectUser) {
        await processGoogleUser(redirectUser);
        setLoading(false);
        return;
      }

      // Read Device Local Session
      const activeSession = await storageService.get('tr_active_session', null);
      if (activeSession && activeSession.email) {
        const found = savedTeachers.find(t => t.email.toLowerCase() === activeSession.email?.toLowerCase());
        setCurrentUser(found || activeSession);
      } else {
        setCurrentUser(null);
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
      const refreshedUser = updatedTeachers.find(t => t.email.toLowerCase() === currentUser.email?.toLowerCase());
      if (refreshedUser) setCurrentUser(refreshedUser);
    }
  };

  // Add Authorized Teacher / Admin Email (Admin Function)
  const addTeacherEmail = async (email, name = '', role = 'teacher') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    const existing = teachers.find(t => t.email.toLowerCase() === cleanEmail);
    if (existing) return existing;

    const newTeacher = {
      id: 't_' + Date.now(),
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0].replace('.', ' '),
      role: cleanEmail === 'idrislaheri72@gmail.com' ? 'admin' : role,
      assignments: []
    };

    const newList = [...teachers, newTeacher];
    await updateTeachersList(newList);
    return newTeacher;
  };

  // Toggle Admin / Teacher Role (Admin Function)
  const toggleAdminRole = async (teacherId) => {
    const target = teachers.find(t => t.id === teacherId);
    if (target?.email.toLowerCase() === 'idrislaheri72@gmail.com') {
      alert("Primary Admin (idrislaheri72@gmail.com) role cannot be demoted.");
      return;
    }

    const updated = teachers.map(t => {
      if (t.id === teacherId) {
        const nextRole = t.role === 'admin' ? 'teacher' : 'admin';
        return { ...t, role: nextRole };
      }
      return t;
    });
    await updateTeachersList(updated);
  };

  // Remove Authorized Email (Admin Function)
  const removeTeacherEmail = async (teacherId) => {
    const target = teachers.find(t => t.id === teacherId);
    if (target?.email.toLowerCase() === 'idrislaheri72@gmail.com') {
      alert("Primary Admin (idrislaheri72@gmail.com) cannot be removed.");
      return;
    }

    const newList = teachers.filter(t => t.id !== teacherId);
    await updateTeachersList(newList);
  };

  // Real Google OAuth Handler
  const loginWithGoogleOAuth = async () => {
    setAuthError(null);
    setUnauthorizedEmail(null);
    try {
      const gUser = await signInWithGoogleCloud();
      if (gUser) {
        return await processGoogleUser(gUser);
      }
    } catch (e) {
      console.error("OAuth error:", e);
      if (e.code === 'auth/unauthorized-domain') {
        setAuthError("Domain not authorized in Firebase. Add your Vercel URL to Firebase Console > Auth > Settings > Authorized Domains.");
      } else if (e.code === 'auth/operation-not-allowed') {
        setAuthError("Google Provider not enabled in Firebase Console yet.");
      } else {
        setAuthError(e.message || "Google Sign-In failed.");
      }
    }
  };

  // Process Google User & Verify Authorization Roster
  const processGoogleUser = async (googleUserObj) => {
    if (!googleUserObj || !googleUserObj.email) return;

    const email = googleUserObj.email.trim().toLowerCase();

    // Primary Admin Check
    if (email === 'idrislaheri72@gmail.com') {
      let adminProfile = teachers.find(t => t.email.toLowerCase() === email);
      if (!adminProfile) {
        adminProfile = {
          id: 'admin_idris',
          email: 'idrislaheri72@gmail.com',
          name: googleUserObj.name || 'Idris Laheri',
          role: 'admin',
          photoURL: googleUserObj.photoURL || null,
          assignments: []
        };
        await updateTeachersList([...teachers, adminProfile]);
      } else {
        adminProfile.role = 'admin';
      }
      setCurrentUser(adminProfile);
      await storageService.set('tr_active_session', adminProfile);
      return adminProfile;
    }

    // Teacher / Co-Admin Authorization Check
    let existingUser = teachers.find(t => t.email.toLowerCase() === email);
    if (existingUser) {
      setCurrentUser(existingUser);
      await storageService.set('tr_active_session', existingUser);
      return existingUser;
    } else {
      // User is not on authorized roster!
      setUnauthorizedEmail(email);
      setCurrentUser(null);
      await storageService.set('tr_active_session', null);
      return null;
    }
  };

  const logout = async () => {
    await signOutCloud();
    setCurrentUser(null);
    setAuthError(null);
    setUnauthorizedEmail(null);
    await storageService.set('tr_active_session', null);
  };

  const isAdmin = currentUser?.email?.toLowerCase() === 'idrislaheri72@gmail.com' || currentUser?.role === 'admin';

  // Verification Helper: Is teacher assigned to Class + Subject?
  const isAssigned = (std, subject) => {
    if (!currentUser) return false;
    if (isAdmin) return true; // Admin sees all
    const key = `${std}|${subject}`;
    return (currentUser.assignments || []).includes(key);
  };

  // Filtered List of Classes Assigned to Current User
  const getScopedStds = (allStds = SEED_STDS, subjectsByStd = {}) => {
    if (!currentUser) return [];
    if (isAdmin) return allStds;

    const teacherAssignments = currentUser.assignments || [];
    return allStds.filter(std => {
      const stdSubjects = subjectsByStd[std] || [];
      return stdSubjects.some(sub => teacherAssignments.includes(`${std}|${sub}`));
    });
  };

  // Filtered List of Subjects Assigned to Current User for Selected Class
  const getScopedSubjects = (std, stdSubjects = []) => {
    if (!currentUser || !std) return [];
    if (isAdmin) return stdSubjects;

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
        authError,
        unauthorizedEmail,
        loginWithGoogleOAuth,
        processGoogleUser,
        addTeacherEmail,
        toggleAdminRole,
        removeTeacherEmail,
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
