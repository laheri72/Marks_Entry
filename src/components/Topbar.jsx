import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, Settings, FileSpreadsheet, Shield } from 'lucide-react';

export const Topbar = ({ currentView, setView }) => {
  const { currentUser, isAdmin, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">R</div>
        <div className="brand-text">
          <div className="name">The Register</div>
          <div className="sub">Formative Assessment</div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="user-info">
          <div>
            <span className="user-name">{currentUser.name}</span>
            {currentUser.email && <div className="user-email">{currentUser.email}</div>}
          </div>
          <span className={`role-badge ${isAdmin ? 'admin' : ''}`}>
            {isAdmin ? 'Admin' : 'Teacher'}
          </span>
        </div>

        <button
          className={`iconbtn ${currentView === 'entry' ? 'active' : ''}`}
          onClick={() => setView('entry')}
        >
          <BookOpen size={15} /> Marks entry
        </button>

        <button
          className={`iconbtn ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setView('settings')}
        >
          <Settings size={15} /> ⚙ Settings
        </button>

        {isAdmin && (
          <button
            className={`iconbtn ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => setView('reports')}
          >
            <FileSpreadsheet size={15} /> 📋 Reports
          </button>
        )}

        <button className="iconbtn" onClick={logout} title="Sign Out">
          <LogOut size={15} /> Log out
        </button>
      </div>
    </header>
  );
};
