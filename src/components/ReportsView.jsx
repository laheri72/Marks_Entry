import React, { useState } from 'react';
import { exportService } from '../services/exportService';
import { FileSpreadsheet, FileText, CheckCircle, Clock, Download } from 'lucide-react';

export const ReportsView = ({ stds, subjectsByStd, studentsByStd, marksMap, maxMarks }) => {
  const [selectedReportStd, setSelectedReportStd] = useState(stds[0] || null);
  const [selectedReportSubject, setSelectedReportSubject] = useState(null);

  const currentStudents = selectedReportStd ? (studentsByStd[selectedReportStd] || []).slice().sort((a, b) => (a.roll || 0) - (b.roll || 0)) : [];
  const currentKey = selectedReportStd && selectedReportSubject ? `${selectedReportStd}|${selectedReportSubject}` : null;
  const currentMarks = currentKey ? (marksMap[currentKey] || {}) : {};
  const currentMax = currentKey ? (maxMarks[currentKey] || 100) : 100;

  return (
    <div>
      {/* SECTION 1: OVERVIEW MATRIX */}
      <div className="step-block">
        <div className="step-title">
          <CheckCircle size={18} color="var(--gold)" />
          Overview — Completion matrix by class &amp; subject
        </div>
        <div className="panel" style={{ overflow: 'auto', padding: 0 }}>
          <table className="overview-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Completion Progress</th>
                <th>Last Activity</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {stds.flatMap((s) => {
                const subs = subjectsByStd[s] || [];
                const totalStudents = (studentsByStd[s] || []).length;

                return subs.map((sub) => {
                  const key = `${s}|${sub}`;
                  const entries = marksMap[key] || {};
                  const filledCount = Object.keys(entries).length;

                  let lastTime = 0;
                  let lastTeacher = '';
                  Object.values(entries).forEach((e) => {
                    if (e.at > lastTime) {
                      lastTime = e.at;
                      lastTeacher = e.enteredByName;
                    }
                  });

                  const isComplete = totalStudents > 0 && filledCount === totalStudents;
                  const isEmpty = filledCount === 0;
                  const max = maxMarks[key] || 100;

                  return (
                    <tr
                      key={key}
                      onClick={() => {
                        setSelectedReportStd(s);
                        setSelectedReportSubject(sub);
                      }}
                    >
                      <td style={{ fontWeight: 600 }}>Class {s}</td>
                      <td>{sub}</td>
                      <td>
                        <span className={`prog-pill ${isComplete ? 'complete' : isEmpty ? 'empty' : ''}`}>
                          {filledCount} / {totalStudents} filled
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                        {lastTime ? (
                          <>
                            <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {new Date(lastTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {lastTeacher}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => exportService.exportToCSV(s, sub, studentsByStd[s] || [], entries, max)}
                            title="Export Excel"
                          >
                            <FileSpreadsheet size={12} color="var(--green-ok)" /> CSV
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => exportService.exportToPDF(s, sub, studentsByStd[s] || [], entries, max)}
                            title="Export PDF"
                          >
                            <FileText size={12} color="var(--red)" /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: DRILLDOWN REPORT GENERATOR */}
      <div className="step-block">
        <div className="step-title">
          <Download size={18} color="var(--gold)" />
          Standard &amp; Subject Class Report Generator
        </div>
        <div className="tabrow" style={{ marginBottom: '14px' }}>
          {stds.map((s) => (
            <button
              key={s}
              className={`tab ${selectedReportStd === s ? 'active' : ''}`}
              onClick={() => {
                setSelectedReportStd(s);
                setSelectedReportSubject(null);
              }}
            >
              Class {s}
            </button>
          ))}
        </div>

        {selectedReportStd && (
          <div className="tabrow">
            {(subjectsByStd[selectedReportStd] || []).map((sub) => (
              <button
                key={sub}
                className={`tab ${selectedReportSubject === sub ? 'active' : ''}`}
                onClick={() => setSelectedReportSubject(sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: REPORT DRILLDOWN PREVIEW & EXPORT ACTIONS */}
      {selectedReportStd && selectedReportSubject && (
        <div className="ledger-card" style={{ marginTop: '20px' }}>
          <div className="ledger-head">
            <div>
              <h3>Class {selectedReportStd} · {selectedReportSubject} Report Card</h3>
              <div className="meta">{currentStudents.length} students enrolled · Audit View</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-gold btn-sm"
                onClick={() => exportService.exportToCSV(selectedReportStd, selectedReportSubject, currentStudents, currentMarks, currentMax)}
              >
                <FileSpreadsheet size={14} /> Download Excel / CSV
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => exportService.exportToPDF(selectedReportStd, selectedReportSubject, currentStudents, currentMarks, currentMax)}
              >
                <FileText size={14} /> Print / Save as PDF
              </button>
            </div>
          </div>

          <div className="ledger-rows">
            {currentStudents.map((st) => {
              const entry = currentMarks[st.id];
              return (
                <div key={st.id} className="ledger-row" style={{ gridTemplateColumns: '50px 1fr 120px 200px' }}>
                  <div className="roll">{st.roll ?? '—'}</div>
                  <div className="sname">{st.name}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, color: 'var(--ink)' }}>
                    {entry ? `${entry.value} / ${currentMax}` : <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>—</span>}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-faint)', lineHeight: 1.3 }}>
                    {entry ? (
                      <>
                        By: <b>{entry.enteredByName}</b><br />
                        {new Date(entry.at).toLocaleString()}
                      </>
                    ) : (
                      'Not Entered'
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
