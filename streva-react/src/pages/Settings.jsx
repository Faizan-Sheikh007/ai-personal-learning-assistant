import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { showToast } = useApp();
  const [prefs, setPrefs] = useState({ goal: 45, notifFreq: 'Real-time', aiDifficulty: 'Automatic' });
  const [learning, setLearning] = useState({ style: 'Mixed', quizFreq: 'After every lesson', certNotif: 'Enabled' });

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>Settings</h2>
        <p style={{ fontSize: '.83rem', color: 'var(--text3)', marginTop: 3 }}>Customize your Streva experience</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 16 }}>Preferences</h5>
          <div className="fg">
            <label>Daily Study Goal (minutes)</label>
            <input type="number" value={prefs.goal} min={15} max={240} onChange={e => setPrefs(p => ({ ...p, goal: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Notification Frequency</label>
            <select value={prefs.notifFreq} onChange={e => setPrefs(p => ({ ...p, notifFreq: e.target.value }))}>
              <option>Real-time</option><option>Daily digest</option><option>Weekly</option>
            </select>
          </div>
          <div className="fg">
            <label>AI Difficulty Adjustment</label>
            <select value={prefs.aiDifficulty} onChange={e => setPrefs(p => ({ ...p, aiDifficulty: e.target.value }))}>
              <option>Automatic</option><option>Manual</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Preferences saved!')}>Save Preferences</button>
        </div>

        <div className="card">
          <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 16 }}>AI &amp; Learning</h5>
          <div className="fg">
            <label>Preferred Learning Style</label>
            <select value={learning.style} onChange={e => setLearning(p => ({ ...p, style: e.target.value }))}>
              <option>Visual (videos + diagrams)</option><option>Reading (text + PDFs)</option><option>Mixed</option>
            </select>
          </div>
          <div className="fg">
            <label>Quiz Frequency</label>
            <select value={learning.quizFreq} onChange={e => setLearning(p => ({ ...p, quizFreq: e.target.value }))}>
              <option>After every lesson</option><option>Daily</option><option>Weekly</option>
            </select>
          </div>
          <div className="fg">
            <label>Certificate Notifications</label>
            <select value={learning.certNotif} onChange={e => setLearning(p => ({ ...p, certNotif: e.target.value }))}>
              <option>Enabled</option><option>Disabled</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Settings saved!')}>Save Settings</button>
        </div>
      </div>

      <div className="card mt-16">
        <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 16 }}>Danger Zone</h5>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-danger btn-sm" onClick={() => showToast('Data cleared (demo)', 'error')}>🗑 Clear Learning Data</button>
          <button className="btn btn-danger btn-sm" onClick={() => showToast('Account reset (demo)', 'error')}>⚠ Reset Account</button>
        </div>
      </div>
    </div>
  );
}
