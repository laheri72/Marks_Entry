import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SEED_STDS, SEED_SUBJECTS, SEED_STUDENTS } from '../seedData';
import { Plus, Trash2, UserPlus, Shield, Check, Database, Mail, UserCheck, Key } from 'lucide-react';

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
  const { currentUser, isAdmin, teachers, addTeacherEmail, removeTeacherEmail, updateTeachersList } = useAuth();
  const [selectedSettingStd, setSelectedSettingStd] = useState(stds[0] || null);
  const [seedStatus, setSeedStatus] = useState('');

  // New Teacher Email State
  const [newTeacherEmailInput, setNewTeacherEmailInput] = useState('');
  const [newTeacherNameInput, setNewTeacherNameInput] = useState('');

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

  // Add Authorized Teacher Email
  const handleAuthorizeTeacher = async () => {
    if (!newTeacherEmailInput.trim()) return;
    await addTeacherEmail(newTeacherEmailInput.trim(), newTeacherNameInput.trim());
    setNewTeacherEmailInput('');
    setNewTeacherNameInput('');
    setSeedStatus('✓ Teacher email authorized successfully.');
    setTimeout(() => setSeedStatus(''), 4000);
  };

  // Force Sync Seed Data to Cloud Database
  const handleForceSeedCloud = async () => {
    if (!window.confirm("Seed/Overwrite Cloud Database with all 27 MSB Classes & 550+ Bohra Students?")) return;
    setSeedStatus('Syncing seed data to Firebase Cloud DB...');
    await onSaveAll(SEED_STDS, SEED_SUBJECTS, SEED_STUDENTS, maxMarks);
    setSeedStatus('✓ Cloud Database seeded successfully with 27 Classes and 550+ Students!');
    setTimeout(() => setSeedStatus(''), 6000);
  };

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

      {/* ADMIN EXCLUSIVE: TEACHER MANAGEMENT & GOOGLE AUTH PROVISIONING */}
      {isAdmin && (
        <div className="panel" style={{ borderLeft: '4px solid var(--blue-admin)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Key size={20} color="var(--blue-admin)" />
            <h3 style={{ margin: 0 }}>Teacher Google Account Authorization &amp; Scoped Permissions</h3>
          </div>
          <div className="hint">
            Authorize teacher Google emails. When a teacher signs in with Google, the portal verifies their email against this list and grants access <b>ONLY</b> to their assigned classes.
          </div>

          {/* ADD TEACHER EMAIL INPUT */}
          <div style={{ background: 'var(--paper-deep)', padding: '14px', borderRadius: '8px', border: '1px solid var(--rule)', marginBottom: '18px' }}>
            <h4 style={{ fontSize: '13.5px', margin: '0 0 10px', color: 'var(--ink)' }}>Authorize New Teacher Google Email</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                style={{ flex: 1, minWidth: '220px', padding: '9px 12px', border: '1px solid var(--rule)', borderRadius: '6px', fontSize: '13px' }}
                type="email"
                placeholder="Google Email (e.g. teacher.english@msb.edu)"
                value={newTeacherEmailInput}
                onChange={e => setNewTeacherEmailInput(e.target.value)}
              />
              <input
                style={{ flex: 1, minWidth: '160px', padding: '9px 12px', border: '1px solid var(--rule)', borderRadius: '6px', fontSize: '13px' }}
                type="text"
                placeholder="Teacher Name (Optional)"
                value={newTeacherNameInput}
                onChange={e => setNewTeacherNameInput(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAuthorizeTeacher}>
                <UserPlus size={14} /> Authorize Teacher Email
              </button>
            </div>
          </div>

          {/* AUTHORIZED TEACHERS LIST & PERMISSION MATRIX */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {teachers.map((t) => {
              const teacherAssignments = t.assignments || [];
              const isPrimaryAdmin = t.email.toLowerCase() === 'idrislaheri72@gmail.com';

              return (
                <div
                  key={t.id}
                  style={{
                    background: '#fff',
                    border: isPrimaryAdmin ? '2px solid var(--gold)' : '1px solid var(--rule)',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{t.name}</strong>
                      <span style={{ fontSize: '12.5px', color: 'var(--ink-faint)', marginLeft: '10px', fontFamily: 'IBM Plex Mono' }}>
                        <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {t.email}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`role-badge ${t.role === 'admin' ? 'admin' : ''}`}>
                        {t.role === 'admin' ? '👑 Primary Admin' : `📚 ${teacherAssignments.length} Assigned Subjects`}
                      </span>

                      {!isPrimaryAdmin && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--red)', borderColor: 'var(--red-soft)' }}
                          onClick={() => removeTeacherEmail(t.id)}
                          title="Revoke Teacher Access"
                        >
                          <Trash2 size={13} /> Revoke
                        </button>
                      )}
                    </div>
                  </div>

                  {!isPrimaryAdmin && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--rule)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '8px' }}>
                        Assigned Class &amp; Subject Pairs for {t.name}:
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
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
                                  fontSize: '12px',
                                  background: checked ? 'var(--paper-deep)' : 'transparent',
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

      {/* PANEL 2: MASTER CLASSES LIST & CLOUD SEEDING */}
      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3>Master Classes List</h3>
            <div className="hint" style={{ margin: 0 }}>Classes currently configured in the school system.</div>
          </div>

          {isAdmin && (
            <button className="btn btn-ghost btn-sm" onClick={handleForceSeedCloud} title="Push Seed Data to Firebase">
              <Database size={14} color="var(--gold)" /> Sync All Seed Rosters to Cloud DB
            </button>
          )}
        </div>

        {seedStatus && (
          <div style={{ margin: '12px 0 0', padding: '8px 12px', background: 'var(--green-soft)', color: 'var(--green-ok)', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600 }}>
            {seedStatus}
          </div>
        )}

        <div className="chip-row" style={{ marginTop: '14px' }}>
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

      {/* PANEL 3: SUBJECTS & STUDENTS PER CLASS */}
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
    </div>
  );
};
