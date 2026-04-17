import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const INTERESTS = [
  { val: 'network', label: '🌐 Network Security' },
  { val: 'hacking', label: '💻 Ethical Hacking' },
  { val: 'crypto', label: '🔑 Cryptography' },
  { val: 'forensics', label: '🔍 Digital Forensics' },
  { val: 'malware', label: '🦠 Malware Analysis' },
  { val: 'web', label: '🌍 Web App Security' },
];

export default function Onboarding({ onComplete }) {
  const { register, login, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', roll: '', role: 'Student' });
  const [selectedInterests, setSelectedInterests] = useState(['network']);
  const [level, setLevel] = useState('beginner');
  const [saving, setSaving] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const toggleInterest = (val) => {
    setSelectedInterests(prev =>
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
    );
  };

  const handleComplete = async () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      showToast('Name, username and password are required', 'error');
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      await register({
        name: form.name,
        email: form.email || `${form.username}@streva.ai`,
        username: form.username,
        password: form.password,
        roll_number: form.roll,
        role: form.role,
      });
      showToast('Account created! Welcome 🚀');
      onComplete();
    } catch (e) {
      showToast(e.message || 'Registration failed', 'error');
    }
    setSaving(false);
  };

  const handleLogin = async () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      showToast('Username and password required', 'error');
      return;
    }
    setSaving(true);
    try {
      await login(loginForm.username, loginForm.password);
      showToast('Welcome back! 👋');
      onComplete();
    } catch (e) {
      showToast(e.message || 'Login failed', 'error');
    }
    setSaving(false);
  };

  // ── Login mode ───────────────────────────────────────────────────────────────
  if (isLogin) {
    return (
      <div className="ob-overlay">
        <div className="ob-modal">
          <div className="ob-body">
            <div className="ob-step active">
              <div className="ob-icon">🔐</div>
              <div className="ob-h">Welcome Back</div>
              <div className="ob-sub">Sign in to your Streva account</div>
              <div className="frow" style={{ flexDirection: 'column', gap: 14 }}>
                <div className="fg">
                  <label>Username</label>
                  <input type="text" value={loginForm.username}
                    onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                    placeholder="your_username" autoFocus />
                </div>
                <div className="fg">
                  <label>Password</label>
                  <input type="password" value={loginForm.password}
                    onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
              </div>
            </div>
          </div>
          <div className="ob-footer">
            <span className="ob-skip" onClick={() => setIsLogin(false)}>← Create account</span>
            <button className="btn btn-primary btn-sm" onClick={handleLogin} disabled={saving}>
              {saving ? 'Signing in…' : 'Sign In →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Register mode ────────────────────────────────────────────────────────────
  return (
    <div className="ob-overlay">
      <div className="ob-modal">
        <div className="ob-bar">
          <div className="ob-fill" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        <div className="ob-body">
          {step === 1 && (
            <div className="ob-step active">
              <div className="ob-icon">🚀</div>
              <div className="ob-h">Welcome to Streva</div>
              <div className="ob-sub">Create your account to get started with AI-powered cybersecurity learning.</div>
              <div className="frow">
                <div className="fg">
                  <label>Your Name *</label>
                  <input type="text" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Syed Roni" autoFocus />
                </div>
                <div className="fg">
                  <label>Username *</label>
                  <input type="text" value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    placeholder="syed_roni" />
                </div>
              </div>
              <div className="frow">
                <div className="fg">
                  <label>Password *</label>
                  <input type="password" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="min 6 characters" />
                </div>
                <div className="fg">
                  <label>Email</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@uni.edu" />
                </div>
              </div>
              <div className="frow">
                <div className="fg">
                  <label>Roll Number</label>
                  <input type="text" value={form.roll}
                    onChange={e => setForm(p => ({ ...p, roll: e.target.value }))}
                    placeholder="2024-CS-001" />
                </div>
                <div className="fg">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option>Student</option>
                    <option>Professional</option>
                    <option>Self-Learner</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ob-step active">
              <div className="ob-icon">🎯</div>
              <div className="ob-h">Pick Your Interests</div>
              <div className="ob-sub">Select topics you want to learn. AI will build your personalized curriculum.</div>
              <div className="int-grid">
                {INTERESTS.map(i => (
                  <div key={i.val}
                    className={`int-btn${selectedInterests.includes(i.val) ? ' sel' : ''}`}
                    onClick={() => toggleInterest(i.val)}>
                    {i.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="ob-step active">
              <div className="ob-icon">📈</div>
              <div className="ob-h">Your Experience Level</div>
              <div className="ob-sub">This helps AI calibrate course difficulty and quiz complexity for you.</div>
              <div className="level-row">
                {[
                  { val: 'beginner', icon: '🌱', name: 'Beginner', desc: 'New to cybersecurity' },
                  { val: 'intermediate', icon: '⚡', name: 'Intermediate', desc: 'Some experience' },
                  { val: 'advanced', icon: '🔥', name: 'Advanced', desc: 'Deep knowledge' },
                ].map(l => (
                  <div key={l.val} className={`level-opt${level === l.val ? ' sel' : ''}`} onClick={() => setLevel(l.val)}>
                    <div className="lo-icon">{l.icon}</div>
                    <div className="lo-name">{l.name}</div>
                    <div className="lo-desc">{l.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ob-footer">
          <span className="ob-skip" onClick={() => setIsLogin(true)}>Already have an account?</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '.75rem', color: 'var(--text3)' }}>Step {step} of 3</span>
            {step < 3 ? (
              <button className="btn btn-primary btn-sm" onClick={() => {
                if (step === 1 && (!form.name.trim() || !form.username.trim() || !form.password.trim())) {
                  showToast('Name, username and password are required', 'error'); return;
                }
                setStep(s => s + 1);
              }}>Continue →</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleComplete} disabled={saving}>
                {saving ? 'Creating account…' : 'Get Started 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
