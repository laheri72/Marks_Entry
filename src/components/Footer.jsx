import React, { useState } from 'react';
import { Github, Shield, FileText, X } from 'lucide-react';

export const Footer = () => {
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null

  return (
    <>
      <footer className="app-footer d-print-none">
        <div className="footer-inner">
          <div className="footer-links">
            <button type="button" className="footer-link" onClick={() => setActiveModal('privacy')}>
              <Shield size={12} /> Privacy Policy
            </button>
            <span className="dot">•</span>
            <button type="button" className="footer-link" onClick={() => setActiveModal('terms')}>
              <FileText size={12} /> Terms of Service
            </button>
          </div>

          <div className="footer-copy">
            &copy; {new Date().getFullYear()} <strong>Maskan1447</strong>. All rights Reserved | Maintained by{' '}
            <a
              href="https://github.com/laheri72/"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              <Github size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '2px' }} />
              <strong>Laheri72</strong>
            </a>
          </div>
        </div>
      </footer>

      {/* PRIVACY POLICY & TERMS OF SERVICE MODAL */}
      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {activeModal === 'privacy' ? (
                <div>
                  <p><strong>Al Jamea Tus Saifiyah — Marol Campus</strong></p>
                  <p>This institutional assessment portal respects academic privacy and security:</p>
                  <ul>
                    <li>All assessment marks and student rosters are encrypted and stored securely in Firebase Cloud Firestore.</li>
                    <li>Authentication is managed strictly via Institutional Google Accounts.</li>
                    <li>No personal student data is shared with third parties or outside networks.</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p><strong>Al Jamea Tus Saifiyah — Marol Campus</strong></p>
                  <p>By accessing and utilizing The Register Assessment System, faculty members agree to:</p>
                  <ul>
                    <li>Maintain confidentiality of student assessment scores and academic evaluation records.</li>
                    <li>Access only course rosters authorized by University Administration.</li>
                    <li>Ensure accurate entry and verification of formative evaluation marks.</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
