import React, { useState, useEffect, Component } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Topbar } from './components/Topbar';
import { LoginScreen } from './components/LoginScreen';
import { ScopedPicker } from './components/ScopedPicker';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { SEED_STDS, SEED_SUBJECTS, SEED_STUDENTS } from './seedData';
import { storageService, STORAGE_KEYS } from './services/storageService';

// Error Boundary Fallback to prevent white blank screen in production
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEF3E8', padding: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #C6D3BC', borderRadius: '12px', padding: '32px', maxWidth: '440px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontFamily: 'Fraunces', color: '#B4382C', margin: '0 0 8px' }}>Application Notice</h2>
            <p style={{ fontSize: '13.5px', color: '#55636F', margin: '0 0 16px' }}>
              The application encountered a temporary error.
            </p>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{ background: '#1E2A38', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset Cache &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainApp = () => {
  const { currentUser, loading } = useAuth();

  // App State
  const [stds, setStds] = useState(SEED_STDS);
  const [subjectsByStd, setSubjectsByStd] = useState(SEED_SUBJECTS);
  const [studentsByStd, setStudentsByStd] = useState(SEED_STUDENTS);
  const [maxMarks, setMaxMarks] = useState({});
  const [marksMap, setMarksMap] = useState({});

  // Active Selections
  const [selectedStd, setSelectedStd] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentView, setView] = useState('entry'); // 'entry' | 'settings' | 'reports'

  // Initialize Data from Storage or Seed Fallbacks
  useEffect(() => {
    async function loadAppData() {
      try {
        const storedStds = await storageService.get(STORAGE_KEYS.STDS, null);
        if (storedStds) setStds(storedStds);
        else await storageService.set(STORAGE_KEYS.STDS, SEED_STDS);

        const storedSubjects = await storageService.get(STORAGE_KEYS.SUBJECTS, null);
        if (storedSubjects) setSubjectsByStd(storedSubjects);
        else await storageService.set(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);

        const storedStudents = await storageService.get(STORAGE_KEYS.STUDENTS, null);
        if (storedStudents) setStudentsByStd(storedStudents);
        else await storageService.set(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);

        const storedMax = await storageService.get(STORAGE_KEYS.MAX_MARKS, {});
        setMaxMarks(storedMax);

        const storedMarks = await storageService.get(STORAGE_KEYS.MARKS, {});
        setMarksMap(storedMarks);
      } catch (e) {
        console.warn("Error loading app data:", e);
      }
    }
    loadAppData();
  }, []);

  // Save Marks Entry Handler
  const handleSaveMarks = async (std, subject, inputValues) => {
    const key = `${std}|${subject}`;
    const updatedKeyObj = { ...(marksMap[key] || {}) };
    const now = Date.now();

    Object.entries(inputValues).forEach(([sid, val]) => {
      if (val !== '' && val !== null) {
        updatedKeyObj[sid] = {
          value: String(val),
          enteredBy: currentUser?.id || currentUser?.email,
          enteredByName: currentUser?.name || 'Teacher',
          at: now
        };
      } else {
        delete updatedKeyObj[sid];
      }
    });

    const nextMarksMap = { ...marksMap, [key]: updatedKeyObj };
    setMarksMap(nextMarksMap);
    await storageService.set(STORAGE_KEYS.MARKS, nextMarksMap);
  };

  // Master Data Save Handler from Settings
  const handleSaveAll = async (newStds, newSubjects, newStudents, newMaxMarks = maxMarks) => {
    if (newStds) { setStds(newStds); await storageService.set(STORAGE_KEYS.STDS, newStds); }
    if (newSubjects) { setSubjectsByStd(newSubjects); await storageService.set(STORAGE_KEYS.SUBJECTS, newSubjects); }
    if (newStudents) { setStudentsByStd(newStudents); await storageService.set(STORAGE_KEYS.STUDENTS, newStudents); }
    if (newMaxMarks) { setMaxMarks(newMaxMarks); await storageService.set(STORAGE_KEYS.MAX_MARKS, newMaxMarks); }
  };

  if (loading) {
    return (
      <div className="login-screen">
        <div style={{ fontFamily: 'Fraunces', color: 'var(--ink-soft)', fontSize: '18px' }}>
          Opening The Register…
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div id="app">
      <Topbar currentView={currentView} setView={setView} />
      <main>
        <div className="wrap">
          {currentView === 'entry' && (
            <ScopedPicker
              stds={stds}
              subjectsByStd={subjectsByStd}
              studentsByStd={studentsByStd}
              selectedStd={selectedStd}
              setSelectedStd={setSelectedStd}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              maxMarks={maxMarks}
              setMaxMarks={setMaxMarks}
              marksMap={marksMap}
              onSaveMarks={handleSaveMarks}
              onGotoSettings={() => setView('settings')}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              stds={stds}
              subjectsByStd={subjectsByStd}
              studentsByStd={studentsByStd}
              marksMap={marksMap}
              maxMarks={maxMarks}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              stds={stds}
              setStds={setStds}
              subjectsByStd={subjectsByStd}
              setSubjectsByStd={setSubjectsByStd}
              studentsByStd={studentsByStd}
              setStudentsByStd={setStudentsByStd}
              maxMarks={maxMarks}
              setMaxMarks={setMaxMarks}
              onSaveAll={handleSaveAll}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
