import React from 'react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { label: 'Main', items: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'courses', icon: '📚', label: 'My Courses' },
    { id: 'path', icon: '🗺️', label: 'Learning Path', tag: 'AI' },
  ]},
  { label: 'Learn', items: [
    { id: 'quiz', icon: '✏️', label: 'Assessments', badge: '3' },
    { id: 'progress', icon: '📊', label: 'Progress' },
    { id: 'badges', icon: '🏆', label: 'Badges' },
  ]},
  { label: 'Tools', items: [
    { id: 'upload', icon: '📁', label: 'Upload Content' },
    { id: 'ai', icon: '🤖', label: 'AI Tutor', tag: 'Beta' },
  ]},
  { label: 'Account', items: [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ]},
];

export default function Sidebar({ isOpen }) {
  const { user, currentPage, navigate } = useApp();
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sb-brand">
        <div className="sb-logo">S</div>
        <div className="sb-brand-text">
          <div className="t1">Streva</div>
          <div className="t2">AI Learning Platform</div>
        </div>
      </div>

      <nav className="sb-nav">
        {NAV_ITEMS.map(group => (
          <div key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(item => (
              <div
                key={item.id}
                className={`ni${currentPage === item.id ? ' active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <div className="ni-icon">{item.icon}</div>
                {item.label}
                {item.badge && <span className="ni-badge">{item.badge}</span>}
                {item.tag && <span className="ni-tag">{item.tag}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-ava">{initials}</div>
          <div className="sb-uinfo">
            <div className="un">{user.name}</div>
            <div className="ur">{user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
