import React, { useEffect, useRef } from 'react';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  BarController,
} from 'chart.js';
import { useApp } from '../context/AppContext';
import { CAT_META } from '../data';

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  BarController,
);

function MiniCourseCard({ course, onOpen, onContinue }) {
  const meta = CAT_META[course.cat] || CAT_META.network;
  return (
    <div className="course-card" onClick={() => onOpen(course.id)}>
      <div className="cc-thumb">
        <div className="cc-thumb-bg" style={{ background: meta.color }} />
        <div className="cc-overlay" />
        <h4>{course.title}</h4>
        <div className="cc-badge"><span className="pill pill-gray" style={{ fontSize: '.6rem' }}>{course.materials} Materials</span></div>
      </div>
      <div className="cc-body">
        <div className="cc-author"><span>{meta.icon}</span>{course.instructor}</div>
        <div className="cc-desc">{course.desc}</div>
        <div className="pbar mb-1"><div className="pbar-fill" style={{ width: `${course.progress}%` }} /></div>
        <div className="cc-progress-label">{course.progress}% complete</div>
        <div className="cc-footer">
          <span className={`pill ${meta.pill}`} style={{ fontSize: '.62rem' }}>{course.level}</span>
          <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>⏱ {course.duration}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, courses, navigate } = useApp();
  const donutRef = useRef(null);
  const barRef = useRef(null);
  const donutInst = useRef(null);
  const barInst = useRef(null);

  const h = new Date().getHours();
  const greet = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const inProgress = courses.filter(c => c.status === 'in-progress');

  useEffect(() => {
    // Always destroy before re-creating to avoid "Canvas already in use" errors
    if (donutInst.current) { donutInst.current.destroy(); donutInst.current = null; }
    if (barInst.current)   { barInst.current.destroy();   barInst.current = null;   }

    if (donutRef.current) {
      donutInst.current = new Chart(donutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Passed', 'Progress', 'Overdue', 'Failed'],
          datasets: [{ data: [74, 82, 45, 45], backgroundColor: ['#6c47ff', '#00d9a6', '#ff6b6b', '#ffb347'], borderWidth: 0, hoverOffset: 4 }],
        },
        options: { responsive: true, cutout: '72%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + c.label + ': ' + c.raw + '%' } } } },
      });
    }

    if (barRef.current) {
      barInst.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{ label: 'Hours', data: [1.5, 2, 0.5, 3, 2.5, 4, 1], backgroundColor: 'rgba(108,71,255,.6)', borderRadius: 6, hoverBackgroundColor: '#6c47ff' }],
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#6b7099', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#6b7099', font: { size: 11 } } } } },
      });
    }

    return () => {
      donutInst.current?.destroy(); donutInst.current = null;
      barInst.current?.destroy();   barInst.current = null;
    };
  }, []);

  if (!user) return null;

  return (
    <div>
      <div className="greet-banner">
        <h2>Good {greet}, {user.name.split(' ')[0]} 👋</h2>
        <p>Welcome to Streva — your AI-powered learning system. Check your priority learning.</p>
        <div className="greet-chips">
          <div className="gc gc-purple">⭐ {(user.xp ?? 0).toLocaleString()} XP</div>
          <div className="gc gc-teal">🛡️ {user.level}</div>
          <div className="gc gc-gold">🏆 5 Badges</div>
        </div>
      </div>

      <div className="announce">
        <span className="announce-badge">New</span>
        <div className="announce-text"><strong>Feature: Smart AI Tutoring</strong> — AI-powered tutoring can now explain any material problem in real-time.</div>
        <span className="announce-link" onClick={() => navigate('ai')}>Go to AI Tutor →</span>
      </div>

      <div className="grid-4 mb-24">
        {[
          { icon: '📚', val: courses.length, lbl: 'Enrolled Courses', delta: '+2 this week', up: true },
          { icon: '⏱️', val: 48, lbl: 'Hours Learned', delta: '+5.5 this week', up: true },
          { icon: '✏️', val: '87%', lbl: 'Avg Quiz Score', delta: '↑ 4% vs last', up: true },
          { icon: '🔥', val: user.streak ?? 0, lbl: 'Day Streak', delta: 'Personal best!', up: true },
        ].map((s, i) => (
          <div key={i} className="stat-c">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
            <div className={`stat-delta ${s.up ? 'd-up' : 'd-down'}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-main">
        <div>
          <div className="sec-hd">
            <h3>My Courses</h3>
            <span className="link" onClick={() => navigate('courses')}>View All</span>
          </div>
          <div className="grid-3">
            {courses.slice(0, 3).map(c => (
              <MiniCourseCard key={c.id} course={c} onOpen={(id) => navigate('course-detail', id)} onContinue={() => {}} />
            ))}
          </div>

          <div className="sec-hd mt-16">
            <h3>In Progress</h3>
            <span className="link" onClick={() => navigate('courses')}>View All</span>
          </div>
          <div>
            {inProgress.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">📖</div>
                <div className="es-title">No courses in progress</div>
                <div className="es-sub">Start a course to see it here.</div>
              </div>
            ) : inProgress.map(c => {
              const meta = CAT_META[c.cat] || CAT_META.network;
              return (
                <div key={c.id} className="file-item in-progress-card mb-16" onClick={() => navigate('course-detail', c.id)}>
                  <div className="fi-icon" style={{ background: meta.color, fontSize: '1.2rem', borderRadius: 10 }}>{meta.icon}</div>
                  <div className="fi-info">
                    <div className="fn">{c.title}</div>
                    <div className="fs">{c.materials} Materials · {c.duration}</div>
                  </div>
                  <div style={{ flex: 1, maxWidth: 120 }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginBottom: 4 }}>Completion <strong style={{ color: 'var(--text)' }}>{c.progress}%</strong></div>
                    <div className="pbar"><div className="pbar-fill" style={{ width: `${c.progress}%` }} /></div>
                  </div>
                  <button className="btn btn-primary btn-xs" onClick={e => { e.stopPropagation(); navigate('course-detail', c.id); }}>
                    {c.progress > 0 ? 'Continue' : 'Start'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="ai-card mb-16">
            <div className="ai-hd"><div className="ai-star">✦</div><span>AI Insight</span></div>
            <p>Based on your learning behavior, you excel in <strong style={{ color: 'var(--primary-l)' }}>Network Security</strong> but need more practice in <strong style={{ color: 'var(--accent2)' }}>Cryptography (38% weak)</strong>. AI has scheduled revision sessions.</p>
            <div className="ai-tags">
              <span className="ai-tag">✓ Network</span>
              <span className="ai-tag warn">⚠ Crypto</span>
              <span className="ai-tag danger">↓ Malware 42%</span>
            </div>
            <button className="ai-btn" onClick={() => navigate('ai')}>✦ Ask AI Tutor</button>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '.85rem', fontWeight: 700 }}>Learning Content</span>
              <span className="pill pill-purple">120 Total</span>
            </div>
            <canvas ref={donutRef} width={200} height={200} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: '.73rem' }}>
              {[['var(--primary)', 'Passed', '74%'], ['var(--accent)', 'Progress', '82%'], ['var(--accent2)', 'Overdue', '45%'], ['var(--accent3)', 'Failed', '45%']].map(([bg, lbl, val]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: bg }} />
                  <span>{lbl} <strong>{val}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-16">
        <div className="sec-hd" style={{ marginBottom: 12 }}>
          <h3>Weekly Activity</h3>
          <select style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 8, padding: '4px 10px', fontSize: '.75rem', outline: 'none' }}>
            <option>This Week</option>
            <option>Last Week</option>
          </select>
        </div>
        <canvas ref={barRef} height={80} />
      </div>
    </div>
  );
}
