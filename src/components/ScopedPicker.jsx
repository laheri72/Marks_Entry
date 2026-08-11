import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LedgerRoster } from './LedgerRoster';
import { BookOpen, CheckCircle, ShieldAlert, Settings, Filter, Search } from 'lucide-react';

export const ScopedPicker = ({
  stds,
  subjectsByStd,
  studentsByStd,
  selectedStd,
  setSelectedStd,
  selectedSubject,
  setSelectedSubject,
  maxMarks,
  setMaxMarks,
  marksMap,
  onSaveMarks,
  onGotoSettings
}) => {
  const { currentUser, isAdmin, getScopedStds, getScopedSubjects } = useAuth();
  
  // Grade Filter State (ALL | Grade 1..7)
  const [activeGradeFilter, setActiveGradeFilter] = useState('ALL');
  const [classSearchQuery, setClassSearchQuery] = useState('');

  // STAGE 1: Scoped Classes List for Active User
  const availableStds = getScopedStds(stds, subjectsByStd);

  // Dynamically calculate grades that actually have assigned classes for this user
  const assignedGradesSet = new Set();
  availableStds.forEach(std => {
    const match = std.match(/^(\d+)/);
    if (match) assignedGradesSet.add(match[1]);
  });
  const assignedGrades = Array.from(assignedGradesSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  // Filter availableStds by Grade filter and Search query
  const filteredStds = availableStds.filter(std => {
    const gradeMatch = std.match(/^(\d+)/);
    const gradeNum = gradeMatch ? gradeMatch[1] : null;

    if (activeGradeFilter !== 'ALL' && gradeNum !== activeGradeFilter) {
      return false;
    }
    if (classSearchQuery.trim() !== '' && !std.toLowerCase().includes(classSearchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // STAGE 2: Scoped Subjects List for Selected Class
  const availableSubjects = selectedStd
    ? getScopedSubjects(selectedStd, subjectsByStd[selectedStd] || [])
    : [];

  return (
    <div>
      {/* STEP 1: CLASS SELECTION WITH DYNAMIC GRADE TABS & SEARCH */}
      <div className="step-block">
        <div className="step-title" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--gold)" />
            1 · Choose class
          </div>

          {!isAdmin && (
            <span style={{ fontSize: '12px', color: 'var(--ink-faint)', fontWeight: 400, marginLeft: 'auto' }}>
              Showing assigned classes for <b>{currentUser?.name}</b>
            </span>
          )}
        </div>

        {/* DYNAMIC GRADE FILTER TAB BAR (ONLY SHOWS TAGGED/ASSIGNED GRADES) */}
        {availableStds.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={13} /> Filter Grade:
            </div>

            <button
              className={`grade-tab ${activeGradeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveGradeFilter('ALL')}
            >
              All Assigned ({availableStds.length})
            </button>

            {assignedGrades.map(g => (
              <button
                key={g}
                className={`grade-tab ${activeGradeFilter === g ? 'active' : ''}`}
                onClick={() => setActiveGradeFilter(g)}
              >
                Grade {g}
              </button>
            ))}

            {/* Quick Search */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid var(--rule)', borderRadius: '6px', padding: '4px 10px' }}>
              <Search size={14} color="var(--ink-faint)" />
              <input
                type="text"
                placeholder="Search class..."
                value={classSearchQuery}
                onChange={e => setClassSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: '12.5px', width: '110px', outline: 'none', fontFamily: 'IBM Plex Sans' }}
              />
            </div>
          </div>
        )}

        {/* CLASSES TAB GRID */}
        <div className="tabrow">
          {availableStds.length === 0 ? (
            <div className="panel" style={{ width: '100%', textAlign: 'center', padding: '30px 20px' }}>
              <ShieldAlert size={32} color="var(--gold)" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontFamily: 'Fraunces', fontSize: '17px', margin: '0 0 6px' }}>
                No classes assigned yet
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--ink-faint)', maxWidth: '420px', margin: '0 auto 16px' }}>
                Your account (<b>{currentUser?.email || currentUser?.name}</b>) currently has zero subject assignments. Please contact the School Admin to grant subject access in Settings.
              </p>
              {isAdmin && (
                <button className="btn btn-gold btn-sm" onClick={onGotoSettings}>
                  <Settings size={14} /> Open Settings to Assign Subjects
                </button>
              )}
            </div>
          ) : filteredStds.length === 0 ? (
            <div className="subtle-note" style={{ padding: '12px 0' }}>
              No classes match Grade {activeGradeFilter} filter or search query "{classSearchQuery}".
            </div>
          ) : (
            filteredStds.map((std) => {
              const active = selectedStd === std;
              const studentCount = (studentsByStd[std] || []).length;
              return (
                <button
                  key={std}
                  className={`tab ${active ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedStd(std);
                    setSelectedSubject(null);
                  }}
                >
                  Class {std} <span className="cnt">{studentCount}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* STEP 2: SUBJECT SELECTION */}
      {selectedStd && (
        <div className="step-block">
          <div className="step-title">
            <CheckCircle size={18} color="var(--gold)" />
            2 · Choose subject for Class {selectedStd}
          </div>

          <div className="tabrow">
            {availableSubjects.length === 0 ? (
              <span className="subtle-note" style={{ fontSize: '13px', color: 'var(--ink-faint)' }}>
                No subjects assigned to you for Class {selectedStd}.
              </span>
            ) : (
              availableSubjects.map((sub) => {
                const active = selectedSubject === sub;
                const key = `${selectedStd}|${sub}`;
                const max = maxMarks[key] || 100;

                return (
                  <button
                    key={sub}
                    className={`tab ${active ? 'active' : ''}`}
                    onClick={() => setSelectedSubject(sub)}
                  >
                    {sub} <span className="cnt">/{max}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* STEP 3: MARKS LEDGER ROSTER */}
      {selectedStd && selectedSubject && (
        <div className="step-block">
          <div className="step-title">
            3 · Enter marks roster
          </div>

          <LedgerRoster
            std={selectedStd}
            subject={selectedSubject}
            students={studentsByStd[selectedStd] || []}
            maxMarks={maxMarks[`${selectedStd}|${selectedSubject}`] || 100}
            setMaxMarks={(val) => {
              const key = `${selectedStd}|${selectedSubject}`;
              setMaxMarks(prev => ({ ...prev, [key]: val }));
            }}
            savedMarks={marksMap[`${selectedStd}|${selectedSubject}`] || {}}
            onSave={onSaveMarks}
            onGotoSettings={onGotoSettings}
          />
        </div>
      )}
    </div>
  );
};
