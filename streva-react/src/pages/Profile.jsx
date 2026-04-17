import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user, updateUser, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', roll: '', role: '', dailyGoal: 30 });

  // Sync form fields whenever user data loads/changes
  useEffect(() => {
    if (user) {
      setForm({
        name:      user.name      || '',
        email:     user.email     || '',
        roll:      user.roll      || user.roll_number || '',
        role:      user.role      || '',
        dailyGoal: user.dailyGoal || user.daily_goal  || 30,
      });
    }
  }, [user]);

  // Don't render until user is loaded
  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const save = () => {
    updateUser(form);
    setEditing(false);
    showToast('Profile updated!');
  };

  return (
    <div>
      <div className="prof-hd">
        <div className="prof-ava">{initials}</div>
        <div className="prof-info">
          <h2>{user.name}</h2>
          <p>{user.role} · CS Department</p>
          <div className="prof-xp">Total XP: <strong>{(user.xp ?? 0).toLocaleString()}</strong> · {user.level}</div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setEditing(true)}>✏️ Edit</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 14 }}>Profile Info</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '.82rem' }}>
            {[
              ['Email',       user.email],
              ['Roll Number', user.roll || user.roll_number || '—'],
              ['Joined',      'Jan 2024'],
              ['Streak',      '🔥 ' + (user.streak ?? 0) + ' days'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text3)' }}>{k}</span>
                <span style={k === 'Streak' ? { color: 'var(--accent)' } : {}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 14 }}>Interests</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {['🌐 Network Security', '💻 Ethical Hacking', '🦠 Malware Analysis', '🔑 Cryptography'].map(tag => (
              <span key={tag} className="pill pill-purple">{tag}</span>
            ))}
          </div>
          <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 10, marginTop: 16 }}>Stats</h5>
          <div style={{ display: 'flex', gap: 14 }}>
            {[['📚', '6', 'Courses'], ['🏆', '5', 'Badges'], ['🔥', user.streak ?? 0, 'Streak']].map(([icon, val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center', flex: 1, background: 'var(--surface2)', borderRadius: 'var(--r)', padding: 12 }}>
                <div style={{ fontSize: '1.2rem' }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem' }}>{val}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editing && (
        <div className="mo" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div><div className="mt">Edit Profile</div></div>
              <div className="mc" onClick={() => setEditing(false)}>✕</div>
            </div>
            <div className="mb">
              <div className="frow">
                <div className="fg"><label>Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="fg"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              </div>
              <div className="frow">
                <div className="fg"><label>Roll Number</label><input value={form.roll} onChange={e => setForm(p => ({ ...p, roll: e.target.value }))} /></div>
                <div className="fg"><label>Role</label><input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
              </div>
              <div className="fg"><label>Daily Study Goal (min)</label><input type="number" value={form.dailyGoal} onChange={e => setForm(p => ({ ...p, dailyGoal: +e.target.value }))} /></div>
            </div>
            <div className="mf">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={save}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
