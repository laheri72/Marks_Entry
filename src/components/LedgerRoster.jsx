import React, { useState, useEffect, useRef } from 'react';
import { Save, Check, UserPlus, FileSpreadsheet, FileText, Search, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportService } from '../services/exportService';

export const LedgerRoster = ({
  std,
  subject,
  students,
  maxMarks,
  setMaxMarks,
  savedMarks,
  onSave,
  onGotoSettings
}) => {
  const [localValues, setLocalValues] = useState({});
  const [statusMessage, setStatusMessage] = useState('Marks save automatically as you type or press Enter.');
  const [showStamp, setShowStamp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Quick Fill Dropdown State
  const [showQuickFillMenu, setShowQuickFillMenu] = useState(false);

  const inputRefs = useRef({});

  // 1. INITIALIZE LOCAL VALUES WHEN CLASS OR SUBJECT CHANGES (ONLY ON STD/SUBJECT SWITCH)
  useEffect(() => {
    const initial = {};
    students.forEach((st) => {
      const entry = savedMarks[st.id];
      initial[st.id] = entry ? entry.value : '';
    });
    setLocalValues(initial);
    setStatusMessage('Marks save automatically as you type or press Enter.');
    setShowStamp(false);
    setCurrentPage(1);
    setSearchQuery('');
    inputRefs.current = {};

    // Auto-focus first student input when switching class or subject
    setTimeout(() => {
      const firstRef = inputRefs.current[0];
      if (firstRef) {
        firstRef.focus();
      }
    }, 60);
  }, [std, subject]); // Dependent ONLY on std & subject - NOT savedMarks or students!

  const handleInputChange = (studentId, rawValue) => {
    // Sanitize: allow numbers, single decimal point, or 'A' (Absent) / 'E' (Exempt)
    let clean = rawValue.toUpperCase().replace(/[^0-9.AE]/g, '');
    
    // Disallow multiple decimal points
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }

    setLocalValues((prev) => ({ ...prev, [studentId]: clean }));
    setStatusMessage('Unsaved changes — press Enter or click Save marks.');
    setShowStamp(false);
  };

  const executeSave = async () => {
    await onSave(std, subject, localValues);
    setStatusMessage('All marks saved securely.');
    setShowStamp(true);
  };

  // Keyboard Navigation: Enter, Shift+Enter, Up/Down Arrows
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSave();
      if (e.shiftKey) {
        // Jump to previous student
        if (index > 0 && inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      } else {
        // Jump to next student
        if (index + 1 < paginatedStudents.length && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index + 1 < paginatedStudents.length && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Quick Increment Touch Adjusters
  const adjustMark = (studentId, delta) => {
    const currentVal = parseFloat(localValues[studentId] || 0);
    const nextVal = Math.min(Math.max(0, currentVal + delta), maxMarks);
    handleInputChange(studentId, String(nextVal));
  };

  // Bulk Quick Fill Actions
  const handleQuickFillEmpty = (fillValue) => {
    const nextValues = { ...localValues };
    students.forEach(st => {
      if (!nextValues[st.id] || nextValues[st.id] === '') {
        nextValues[st.id] = String(fillValue);
      }
    });
    setLocalValues(nextValues);
    setShowQuickFillMenu(false);
    setStatusMessage(`Filled all empty entries with ${fillValue}. Press Save.`);
  };

  const handleQuickClearAll = () => {
    if (!window.confirm('Clear all unsaved entries for this subject?')) return;
    const nextValues = {};
    students.forEach(st => { nextValues[st.id] = ''; });
    setLocalValues(nextValues);
    setShowQuickFillMenu(false);
    setStatusMessage('Cleared all marks. Click Save to persist.');
  };

  if (students.length === 0) {
    return (
      <div className="ledger-card">
        <div style={{ textAlign: 'center', padding: '50px 24px' }}>
          <UserPlus size={36} color="var(--gold)" style={{ marginBottom: '10px' }} />
          <h3 className="display" style={{ fontSize: '20px', margin: '0 0 8px' }}>
            No students in Class {std} yet
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-faint)', maxWidth: '380px', margin: '0 auto 18px' }}>
            Paste the class list once in Settings and it's ready for every subject and assessment.
          </p>
          <button className="btn btn-gold btn-sm" onClick={onGotoSettings}>
            Add Students Roster
          </button>
        </div>
      </div>
    );
  }

  // Filter students by search query
  const sortedStudents = [...students].sort((a, b) => (a.roll || 0) - (b.roll || 0));
  const filteredStudents = sortedStudents.filter(st => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return st.name.toLowerCase().includes(q) || String(st.roll || '').includes(q);
  });

  // Calculate Pagination
  const totalPages = pageSize === 'ALL' ? 1 : Math.ceil(filteredStudents.length / pageSize);
  const startIndex = pageSize === 'ALL' ? 0 : (currentPage - 1) * pageSize;
  const paginatedStudents = pageSize === 'ALL' ? filteredStudents : filteredStudents.slice(startIndex, startIndex + pageSize);

  // Live Statistics Calculations
  let filledCount = 0;
  let totalScore = 0;
  let highestMark = 0;
  let lowestMark = maxMarks;

  sortedStudents.forEach(st => {
    const val = localValues[st.id];
    if (val !== undefined && val !== '' && val !== 'A' && val !== 'E') {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        filledCount++;
        totalScore += num;
        if (num > highestMark) highestMark = num;
        if (num < lowestMark) lowestMark = num;
      }
    }
  });

  const avgScore = filledCount > 0 ? (totalScore / filledCount).toFixed(1) : '—';
  const fillPct = Math.round((filledCount / sortedStudents.length) * 100);

  return (
    <div className="ledger-card">
      {/* 1. HEADER & MAX MARKS */}
      <div className="ledger-head">
        <div>
          <h3>Class {std} · {subject}</h3>
          <div className="meta">{students.length} students enrolled</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Quick Actions Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowQuickFillMenu(!showQuickFillMenu)}
            >
              <Zap size={14} color="var(--gold)" /> ⚡ Quick Actions
            </button>

            {showQuickFillMenu && (
              <div className="quick-menu">
                <button onClick={() => handleQuickFillEmpty(maxMarks)}>Fill Empty with Max ({maxMarks})</button>
                <button onClick={() => handleQuickFillEmpty(Math.round(maxMarks * 0.75))}>Fill Empty with 75% ({Math.round(maxMarks * 0.75)})</button>
                <button onClick={() => handleQuickFillEmpty('A')}>Mark Remaining as Absent (A)</button>
                <div className="menu-divider"></div>
                <button onClick={handleQuickClearAll} style={{ color: 'var(--red)' }}>Clear All Entries</button>
              </div>
            )}
          </div>

          {/* Configurable Max Marks */}
          <div className="maxmarks">
            Max marks
            <input
              type="number"
              min="1"
              max="1000"
              value={maxMarks}
              onChange={(e) => setMaxMarks(parseInt(e.target.value, 10) || 100)}
            />
          </div>
        </div>
      </div>

      {/* 2. LIVE ANALYTICS DASHBOARD HEADER */}
      <div className="analytics-bar">
        <div className="stat-card">
          <div className="stat-label">Completion</div>
          <div className="stat-val">{filledCount} / {sortedStudents.length} <span className="stat-pct">({fillPct}%)</span></div>
          <div className="progress-bg"><div className="progress-fill" style={{ width: `${fillPct}%` }}></div></div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Class Average</div>
          <div className="stat-val">{avgScore} <span className="stat-sub">/ {maxMarks}</span></div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Highest / Lowest</div>
          <div className="stat-val">{highestMark} <span className="stat-sub">/ {lowestMark === maxMarks && filledCount === 0 ? '—' : lowestMark}</span></div>
        </div>
      </div>

      {/* 3. SEARCH & PAGINATION TOOLBAR */}
      <div className="toolbar-strip">
        {/* Live Search */}
        <div className="search-wrap">
          <Search size={14} color="var(--ink-faint)" />
          <input
            type="text"
            placeholder="Search student or roll #..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Page Size & Switcher */}
        <div className="pagination-wrap">
          <label style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Show:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              const val = e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10);
              setPageSize(val);
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value="ALL">Show All ({filteredStudents.length})</option>
          </select>

          {pageSize !== 'ALL' && totalPages > 1 && (
            <div className="page-nav">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. PAGINATED ROSTER ROWS WITH STABLE INPUT REFS */}
      <div className="ledger-rows">
        {paginatedStudents.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: '13.5px' }}>
            No students found matching "{searchQuery}".
          </div>
        ) : (
          paginatedStudents.map((st, idx) => {
            const val = localValues[st.id] ?? '';
            const isFilled = val !== '';

            return (
              <div key={st.id} className="ledger-row">
                <div className="roll">{st.roll ?? (startIndex + idx + 1)}</div>
                <div className="sname">{st.name}</div>

                {/* Touch Increments + Mark Input */}
                <div className="marks-input-wrap">
                  <div className="touch-adjusters">
                    <button type="button" onClick={() => adjustMark(st.id, -1)} title="Decrease 1">-1</button>
                    <button type="button" onClick={() => adjustMark(st.id, 1)} title="Increase 1">+1</button>
                    <button type="button" onClick={() => handleInputChange(st.id, String(maxMarks))} title="Full Marks">Max</button>
                  </div>

                  <input
                    ref={(el) => (inputRefs.current[idx] = el)}
                    className={`marks-input ${isFilled ? 'filled' : ''}`}
                    type="text"
                    inputMode="decimal"
                    value={val}
                    placeholder="—"
                    onChange={(e) => handleInputChange(st.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onBlur={executeSave}
                  />
                  <span className="marks-of">/ {maxMarks}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. STICKY ACTION FLOATING FOOTER */}
      <div className="ledger-footer sticky-footer">
        <div className="save-status">
          {statusMessage}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => exportService.exportToCSV(std, subject, sortedStudents, savedMarks, maxMarks)}
            title="Export Excel / CSV"
          >
            <FileSpreadsheet size={14} color="var(--green-ok)" /> CSV
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => exportService.exportToPDF(std, subject, sortedStudents, savedMarks, maxMarks)}
            title="Download PDF Report"
          >
            <FileText size={14} color="var(--red)" /> PDF Report
          </button>

          <div className={`stamp ${showStamp ? 'show' : ''}`}>
            <Check size={14} /> Saved
          </div>

          <button className="btn btn-primary btn-sm" onClick={executeSave}>
            <Save size={14} /> Save marks
          </button>
        </div>
      </div>
    </div>
  );
};
