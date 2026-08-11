import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Lock, ShieldAlert, LogIn } from 'lucide-react';

export const LoginScreen = () => {
  const { loginWithGoogleOAuth, processGoogleUser, authError, unauthorizedEmail } = useAuth();
  const [customEmail, setCustomEmail] = useState('');

  const handleCustomGoogleSignIn = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    processGoogleUser({
      email: customEmail.trim(),
      name: customEmail.split('@')[0].replace('.', ' ')
    });
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-mark">R</div>
        <h1 className="login-title">The Register</h1>
        <div className="login-sub">Formative Assessment · Institutional Google Portal</div>

        {/* UNAUTHORIZED ACCOUNT NOTICE */}
        {unauthorizedEmail && (
          <div style={{ background: '#FFF4F2', border: '1px solid #F2B8B2', borderRadius: '8px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B4382C', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              <ShieldAlert size={18} /> Access Pending Approval
            </div>
            <p style={{ fontSize: '12.5px', color: '#55636F', margin: 0, lineHeight: 1.4 }}>
              Your Google account <b>{unauthorizedEmail}</b> is not on the authorized teacher roster yet. Please contact School Admin <b>Idris Laheri</b> (idrislaheri72@gmail.com) to add your email in Settings.
            </p>
          </div>
        )}

        {/* AUTH ERROR NOTICE */}
        {authError && (
          <div style={{ background: '#FFF8E7', border: '1px solid #E9DCB8', borderRadius: '8px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '12.5px', color: '#6b551f' }}>
            <b>Sign-In Notice:</b> {authError}
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        <button
          className="google-btn"
          onClick={loginWithGoogleOAuth}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign in with Google Account
        </button>

        <form onSubmit={handleCustomGoogleSignIn} style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--ink-faint)', marginBottom: '8px', fontWeight: 500 }}>
            Or enter authorized Google email directly:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="e.g. idrislaheri72@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: '1px solid var(--rule)',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'IBM Plex Sans'
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Log in <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--rule)', fontSize: '12px', color: 'var(--ink-faint)', lineHeight: 1.5, textAlign: 'center' }}>
          <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Primary School Admin: <b>idrislaheri72@gmail.com</b><br />
          Teachers must be authorized by Admin in Settings to access.
        </div>
      </div>
    </div>
  );
};
