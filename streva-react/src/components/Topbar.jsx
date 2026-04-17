import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const PAGE_TITLES = {
  dashboard: 'Dashboard', courses: 'My Courses', upload: 'Upload Content',
  quiz: 'Assessments', path: 'Learning Path', progress: 'Progress',
  badges: 'Badges', ai: 'AI Tutor', profile: 'Profile', settings: 'Settings',
  'course-detail': 'Course Detail',
};

export default function Topbar({ onToggleSidebar }) {
  const { user, currentPage, navigate } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onToggleSidebar}>☰</button>
      <div className="tb-title">{PAGE_TITLES[currentPage] || 'Streva'}</div>
      <div className="search-wrap">
        <span style={{ color: 'var(--text3)', fontSize: '.85rem' }}>🔍</span>
        <input type="text" placeholder="Search courses, topics…" />
      </div>
      <div className="tb-right">
        <div
          className="ib"
          style={{ position: 'relative' }}
          onClick={() => setShowNotif(v => !v)}
          title="Notifications"
        >
          🔔
          <div className="ndot" />
          {showNotif && (
            <div className="notif-panel" onClick={e => e.stopPropagation()}>
              <div className="np-hd">
                <h5>Notifications</h5>
                <button className="btn btn-xs btn-ghost" onClick={() => setShowNotif(false)}>Mark all read</button>
              </div>
              <div className="np-item">
                <div className="np-icon" style={{ background: 'rgba(0,217,166,.1)' }}>🎯</div>
                <div>
                  <div style={{ fontSize: '.8rem', fontWeight: 700 }}>Quiz available!</div>
                  <div style={{ fontSize: '.71rem', color: 'var(--text3)' }}>Network Security · Due today</div>
                </div>
              </div>
              <div className="np-item">
                <div className="np-icon" style={{ background: 'rgba(108,71,255,.1)' }}>✦</div>
                <div>
                  <div style={{ fontSize: '.8rem', fontWeight: 700 }}>AI Insight</div>
                  <div style={{ fontSize: '.71rem', color: 'var(--text3)' }}>Your Cryptography score dropped 12%</div>
                </div>
              </div>
              <div className="np-item">
                <div className="np-icon" style={{ background: 'rgba(245,197,24,.1)' }}>🏆</div>
                <div>
                  <div style={{ fontSize: '.8rem', fontWeight: 700 }}>Badge Unlocked!</div>
                  <div style={{ fontSize: '.71rem', color: 'var(--text3)' }}>7-Day Streak — keep it up!</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="ib" title="AI Tutor" onClick={() => navigate('ai')}>🤖</div>
        <div className="tb-ava" onClick={() => navigate('profile')}>{initials}</div>
      </div>
    </header>
  );
}
