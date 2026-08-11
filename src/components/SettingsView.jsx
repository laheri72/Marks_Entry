import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, UserPlus, Shield, Check, Users } from 'lucide-react';

export const SettingsView = ({
  stds,
  setStds,
  subjectsByStd,
  setSubjectsByStd,
  studentsByStd,
  setStudentsByStd,
  maxMarks,
  setMaxMarks,
  onSaveAll
}) => {
  const { currentUser, isAdmin, teachers, updateTeachersList } = useAuth();
  const [selectedSettingStd, setSelectedSettingStd] = useState(stds[0] || null);

  // New Class Input State
  const [newStdName, setNewStdName] = useState('');

  // New Subject Input State
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjMax, setNewSubjMax] = useState('100');

  // Single Student Input State
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentName, setNewStudentName] = useState('');

  // Bulk Student Input State
  const [bulkText, setBulkText] = useState('');

  // Add Class
  const handleAddClass = () => {
    const v = newStdName.trim();
    if (!v || stds.includes(v)) return;
    const nextStds = [...stds, v];
    setStds(nextStds);
    setSubjectsByStd(prev => ({ ...prev, [v]: [] }));
    setStudentsByStd(prev => ({ ...prev, [v]: [] }));
    setSelectedSettingStd(v);
    setNewStdName('');
    onSaveAll(nextStds, { ...subjectsByStd, [v]: [] }, { ...studentsByStd, [v]: [] });
  };

  // Add Subject
  const handleAddSubject = () => {
    const std = selectedSettingStd;
    const name = newSubjName.trim();
    const mm = parseInt(newSubjMax, 10) || 100;
    if (!std || !name) return;

    const existing = subjectsByStd[std] || [];
    if (existing.includes(name)) return;

    const nextSubs = [...existing, name];
    const nextSubjectsByStd = { ...subjectsByStd, [std]: nextSubs };
    const nextMaxMarks = { ...maxMarks, [`${std}|${name}`]: mm };

    setSubjectsByStd(nextSubjectsByStd);
    setMaxMarks(nextMaxMarks);
    setNewSubjName('');
    onSaveAll(stds, nextSubjectsByStd, studentsByStd, nextMaxMarks);
  };

  // Add Single Student
  const handleAddSingleStudent = () => {
    const std = selectedSettingStd;
    const name = newStudentName.trim();
    if (!std || !name) return;

    const existing = studentsByStd[std] || [];
    const roll = newStudentRoll.trim() ? parseInt(newStudentRoll.trim(), 10) : (existing.length + 1);
    const newStudent = {
      id: 'st_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name,
      roll
    };

    const nextStudentsByStd = { ...studentsByStd, [std]: [...existing, newStudent] };
    setStudentsByStd(nextStudentsByStd);
    setNewStudentName('');
    setNewStudentRoll('');
    onSaveAll(stds, subjectsByStd, nextStudentsByStd);
  };

  // Bulk Parse Helper
  const parseBulk = (text) => {
    return text.split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => {
      const parts = line.split(/[,\t]/).map(p => p.trim()).filter(Boolean);
      let roll, name;
      if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
        roll = parseInt(parts[0], 10);
        name = parts.slice(1).join(', ');
      } else {
        roll = idx + 1;
        name = parts.join(', ');
      }
      return { roll, name };
    }).filter(p => p.name);
  };

  const handleBulkAdd = () => {
    const std = selectedSettingStd;
    const parsed = parseBulk(bulkText);
    if (!std || parsed.length === 0) return;

    const existing = studentsByStd[std] || [];
    const existingNames = new Set(existing.map(s => s.name.toLowerCase()));

    parsed.forEach(p => {
      if (!existingNames.has(p.name.toLowerCase())) {
        existing.push({
          id: 'st_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          name: p.name,
          roll: p.roll
        });
      }
    });

    const nextStudentsByStd = { ...studentsByStd, [std]: [...existing] };
    setStudentsByStd(nextStudentsByStd);
    setBulkText('');
    onSaveAll(stds, subjectsByStd, nextStudentsByStd);
  };

  const handleBulkReplace = () => {
    const std = selectedSettingStd;
    const parsed = parseBulk(bulkText);
    if (!std || parsed.length === 0) return;

    if (!window.confirm(`Replace the entire roster for Class ${std} with ${parsed.length} students?`)) return;

    const newRoster = parsed.map(p => ({
      id: 'st_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: p.name,
      roll: p.roll
    }));

    const nextStudentsByStd = { ...studentsByStd, [std]: newRoster };
    setStudentsByStd(nextStudentsByStd);
    setBulkText('');
    onSaveAll(stds, subjectsByStd, nextStudentsByStd);
  };

  // Toggle Teacher Assignment Checkbox
  const toggleTeacherAssignment = async (teacherId, classSubjectKey) => {
    const updated = teachers.map(t => {
      if (t.id === teacherId) {
        const assignments = t.assignments || [];
        const exists = assignments.includes(classSubjectKey);
        const newAssignments = exists
          ? assignments.filter(k => k !== classSubjectKey)
          : [...assignments, classSubjectKey];
        return { ...t, assignments: newAssignments };
      }
      return t;
    });
    await updateTeachersList(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* PANEL 1: CLASSES MASTER */}
      <div className="panel">
        <h3>Master Classes List</h3>
        <div className="hint">Classes currently configured in the school system.</div>
        <div className="chip-row">
          {stds.map(s => (
            <span key={s} className="chip">
              Class {s}
            </span>
          ))}
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px', maxWidth: '380px' }}>
            <input
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--rule)', borderRadius: '6px' }}
              placeholder="e.g. 8-A (Boys)"
              value={newStdName}
              onChange={e => setNewStdName(e.target.value)}
            />
            <button className="btn btn-gold btn-sm" onClick={handleAddClass}>
              <Plus size={14} /> Add Class
            </button>
          </div>
        )}
      </div>

      {/* PANEL 2: SUBJECTS & STUDENTS PER CLASS */}
      <div className="panel">
        <h3>Subjects &amp; Student Rosters</h3>
        <div className="hint">Configure subjects, default max marks, and student rosters per class.</div>

        <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Select Class:</label>
          <select
            style={{ padding: '8px 14px', border: '1px solid var(--rule)', borderRadius: '6px', fontSize: '14px', background: '#fff', fontWeight: 600 }}
            value={selectedSettingStd || ''}
            onChange={e => setSelectedSettingStd(e.target.value)}
          >
            {stds.map(s => (
              <option key={s} value={s}>Class {s}</option>
            ))}
          </select>
        </div>

        {selectedSettingStd && (
          <>
            {/* SUBJECTS BLOCK */}
            <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--rule)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                Subjects for Class {selectedSettingStd}
              </h4>
              <div className="chip-row">
                {(subjectsByStd[selectedSettingStd] || []).map(sub => {
                  const mm = maxMarks[`${selectedSettingStd}|${sub}`] || 100;
                  return (
                    <span key={sub} className="chip">
                      {sub} <span style={{ color: 'var(--ink-faint)', fontFamily: 'IBM Plex Mono', fontSize: '11px' }}>/{mm}</span>
                    </span>
                  );
                })}
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    style={{ flex: 1, minWidth: '140px', padding: '8px 12px', border: '1px solid var(--rule)', borderRadius: '6px' }}
                    placeholder="Subject Name (e.g. Hindi)"
                    value={newSubjName}
                    onChange={e => setNewSubjName(e.target.value)}
                  />
                  <input
                    style={{ width: '90px', padding: '8px 12px', border: '1px solid var(--rule)', borderRadius: '6px', textAlign: 'center' }}
                    type="number"
                    min="1"
                    placeholder="Max Marks"
                    value={newSubjMax}
                    onChange={e => setNewSubjMax(e.target.value)}
                  />
                  <button className="btn btn-gold btn-sm" onClick={handleAddSubject}>
                    <Plus size={14} /> Add Subject
                  </button>
                </div>
              )}
            </div>

            {/* ROSTER BLOCK */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                Students in Class {selectedSettingStd} ({(studentsByStd[selectedSettingStd] || []).length})
              </h4>

              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--rule)', borderRadius: '8px', padding: '8px', marginBottom: '14px', background: 'var(--paper-deep)' }}>
                {(studentsByStd[selectedSettingStd] || []).slice().sort((a, b) => (a.roll || 0) - (b.roll || 0)).map(st => (
                  <div key={st.id} style={{ display: 'flex', gap: '12px', padding: '6px 10px', fontSize: '13.5px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontFamily: 'IBM Plex Mono', color: 'var(--ink-faint)', width: '40px' }}>{st.roll ?? '—'}</span>
                    <span style={{ flex: 1, fontWeight: 500 }}>{st.name}</span>
                  </div>
                ))}
              </div>

              {/* SINGLE STUDENT ADDITION */}
              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input
                    style={{ width: '80px', padding: '8px 12px', border: '1px solid var(--rule)', borderRadius: '6px' }}
                    placeholder="Roll #"
                    value={newStudentRoll}
                    onChange={e => setNewStudentRoll(e.target.value)}
                  />
                  <input
                    style={{ flex: 1, minWidth: '180px', padding: '8px 12px', border: '1px solid var(--rule)', borderRadius: '6px' }}
                    placeholder="Full Student Name"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                  />
                  <button className="btn btn-gold btn-sm" onClick={handleAddSingleStudent}>
                    <UserPlus size={14} /> Add Single Student
                  </button>
                </div>
              )}

              {/* BULK ROSTER IMPORT */}
              {isAdmin && (
                <div style={{ marginTop: '16px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid var(--rule)' }}>
                  <h5 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600 }}>Paste Bulk Roster List</h5>
                  <p style={{ fontSize: '12px', color: 'var(--ink-faint)', margin: '0 0 8px' }}>
                    One student per line: <code>Roll, Name</code> (e.g. <code>1, Aarav Mehta</code>).
                  </p>
                  <textarea
                    style={{ width: '100%', minHeight: '100px', padding: '10px', fontFamily: 'IBM Plex Mono', fontSize: '12.5px', border: '1px solid var(--rule)', borderRadius: '6px', marginBottom: '10px' }}
                    placeholder="1, Aarav Mehta&#10;2, Diya Kulkarni&#10;3, Ishaan Rao"
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-gold btn-sm" onClick={handleBulkAdd}>
                      <Plus size={14} /> Append to List
                    </button>
                    <button className="btn btn-red btn-sm" onClick={handleBulkReplace}>
                      <Trash2 size={14} /> Replace Entire Class Roster
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* PANEL 3: TEACHER SUBJECT ASSIGNMENT MATRIX (ADMIN ONLY) */}
      {isAdmin && (
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Shield size={20} color="var(--blue-admin)" />
            <h3 style={{ margin: 0 }}>Teacher Scoped Permission Assignment Matrix</h3>
          </div>
          <div className="hint">
            Assign exact Class + Subject pairs to each teacher. Teachers will see ONLY their assigned classes when they sign in with Google.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {teachers.map((t) => {
              const teacherAssignments = t.assignments || [];

              return (
                <div
                  key={t.id}
                  style={{
                    background: 'var(--paper-deep)',
                    border: '1px solid var(--rule)',
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{t.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--ink-faint)', marginLeft: '8px', fontFamily: 'IBM Plex Mono' }}>{t.email || t.id}</span>
                    </div>
                    <span className={`role-badge ${t.role === 'admin' ? 'admin' : ''}`}>
                      {t.role === 'admin' ? '👑 Admin (Access All)' : `📚 ${teacherAssignments.length} Assignments`}
                    </span>
                  </div>

                  {t.role !== 'admin' && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '8px' }}>
                        Check assigned Class &amp; Subject pairs for {t.name}:
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                        {stds.flatMap(s => {
                          const subs = subjectsByStd[s] || [];
                          return subs.map(sub => {
                            const key = `${s}|${sub}`;
                            const checked = teacherAssignments.includes(key);

                            return (
                              <label
                                key={key}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '12.5px',
                                  background: checked ? '#fff' : 'transparent',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: checked ? '1px solid var(--gold)' : '1px solid transparent',
                                  cursor: 'pointer'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleTeacherAssignment(t.id, key)}
                                />
                                <span>Class <b>{s}</b> · {sub}</span>
                              </label>
                            );
                          });
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
