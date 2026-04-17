import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController, LineElement, PointElement,
  RadarController, RadialLinearScale,
  CategoryScale, LinearScale,
  Filler, Tooltip, Legend,
} from 'chart.js';
import { useApp } from '../context/AppContext';
import { CAT_META } from '../data';

// Register ALL required controllers and elements
Chart.register(
  LineController, LineElement, PointElement,
  RadarController, RadialLinearScale,
  CategoryScale, LinearScale,
  Filler, Tooltip, Legend,
);

export default function Progress() {
  const { courses, enrollments, user, api } = useApp();
  const lineRef  = useRef(null);
  const radarRef = useRef(null);
  const lineInst  = useRef(null);
  const radarInst = useRef(null);
  const [dashStats, setDashStats] = useState(null);

  // Load dashboard stats (has weekly activity)
  useEffect(() => {
    if (!api) return;
    api('/dashboard/').then(setDashStats).catch(() => {});
  }, [api]);

  // Build weekly labels/data
  const weekLabels = dashStats?.weekly_activity?.map(d => d.day)     || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData   = dashStats?.weekly_activity?.map(d => d.minutes) || [0, 0, 0, 0, 0, 0, 0];

  useEffect(() => {
    // Always destroy before re-creating — prevents "canvas already in use" in React Strict Mode
    if (lineInst.current)  { lineInst.current.destroy();  lineInst.current  = null; }
    if (radarInst.current) { radarInst.current.destroy(); radarInst.current = null; }

    if (lineRef.current) {
      lineInst.current = new Chart(lineRef.current, {
        type: 'line',
        data: {
          labels: weekLabels,
          datasets: [{
            label: 'Minutes Studied',
            data: weekData,
            borderColor: '#6c47ff',
            backgroundColor: 'rgba(108,71,255,.1)',
            fill: true,
            tension: .4,
            pointBackgroundColor: '#6c47ff',
            pointRadius: 4,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#6b7099', font: { size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#6b7099', font: { size: 11 } } },
          },
        },
      });
    }

    if (radarRef.current) {
      radarInst.current = new Chart(radarRef.current, {
        type: 'radar',
        data: {
          labels: ['Network', 'Hacking', 'Crypto', 'Forensics', 'Malware', 'Web'],
          datasets: [{
            label: 'Mastery',
            data: [82, 70, 38, 60, 42, 75],
            borderColor: '#00d9a6',
            backgroundColor: 'rgba(0,217,166,.15)',
            pointBackgroundColor: '#00d9a6',
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { r: { grid: { color: 'rgba(255,255,255,.07)' }, pointLabels: { color: '#a8adc4', font: { size: 11 } }, ticks: { display: false } } },
        },
      });
    }

    return () => {
      lineInst.current?.destroy();  lineInst.current  = null;
      radarInst.current?.destroy(); radarInst.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update line chart data when dashStats loads without rebuilding
  useEffect(() => {
    if (lineInst.current && weekData.some(v => v > 0)) {
      lineInst.current.data.labels           = weekLabels;
      lineInst.current.data.datasets[0].data = weekData;
      lineInst.current.update();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashStats]);

  const totalHours  = dashStats ? dashStats.total_hours_learned : 0;
  const avgScore    = dashStats ? dashStats.avg_quiz_score       : 0;
  const badgesCount = dashStats ? dashStats.badges_count         : (user?.badges_count || 0);

  const enrolledCourses = enrollments || [];
  const inProgress  = enrolledCourses.filter(e => e.status === 'in-progress');
  const completed   = enrolledCourses.filter(e => e.status === 'completed');

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>Progress Analytics</h2>
        <p style={{ fontSize: '.83rem', color: 'var(--text3)', marginTop: 3 }}>Track your learning journey with AI-powered insights</p>
      </div>

      <div className="grid-4 mb-24">
        {[
          { icon: '⚡',  val: (user?.xp ?? 0).toLocaleString(), lbl: 'Total XP',       delta: 'Lifetime XP earned',       up: true },
          { icon: '⏱️', val: `${totalHours}h`,                  lbl: 'Study Time',     delta: 'Total hours learned',      up: true },
          { icon: '🎯',  val: `${avgScore}%`,                    lbl: 'Avg Quiz Score', delta: 'Based on your attempts',   up: avgScore >= 50 },
          { icon: '🏅',  val: badgesCount,                       lbl: 'Badges Earned',  delta: 'Keep going for more!',     up: true },
        ].map((s, i) => (
          <div key={i} className="stat-c">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
            <div className={`stat-delta ${s.up ? 'd-up' : 'd-down'}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <h4 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 14 }}>Weekly Study Activity (minutes)</h4>
          <canvas ref={lineRef} height={140} />
          {weekData.every(v => v === 0) && (
            <div style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--text3)', marginTop: 10 }}>
              No activity recorded yet — start learning!
            </div>
          )}
        </div>
        <div className="card">
          <h4 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 14 }}>Topic Mastery</h4>
          <canvas ref={radarRef} height={180} />
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <h4 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 14 }}>📊 Enrollment Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Total Enrolled', enrolledCourses.length],
              ['In Progress',    inProgress.length],
              ['Completed',      completed.length],
              ['Not Started',    enrolledCourses.filter(e => e.status === 'not-started').length],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.83rem' }}>
                <span style={{ color: 'var(--text2)' }}>{lbl}</span>
                <strong>{val}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 14 }}>🔥 Streak & Goals</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Current Streak', `${user?.streak ?? 0} days`],
              ['Daily Goal',     `${user?.daily_goal || user?.dailyGoal || 30} min/day`],
              ['Level',          user?.level || 'Beginner'],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.83rem' }}>
                <span style={{ color: 'var(--text2)' }}>{lbl}</span>
                <strong>{val}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h4 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 16 }}>Course Progress</h4>
        {enrolledCourses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '.83rem', padding: 20 }}>
            No courses enrolled yet. Start a course to track progress!
          </div>
        ) : enrolledCourses.map(enroll => {
          const course = courses.find(c => c.id === enroll.course);
          if (!course) return null;
          const meta = CAT_META[course.cat] || CAT_META.network;
          return (
            <div key={enroll.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{meta.icon}</span>
                  <span>{course.title}</span>
                  {enroll.status === 'completed'  && <span className="pill pill-teal"   style={{ fontSize: '.6rem' }}>✓ Done</span>}
                  {enroll.status === 'in-progress' && <span className="pill pill-purple" style={{ fontSize: '.6rem' }}>▶ Active</span>}
                </div>
                <strong>{enroll.progress}%</strong>
              </div>
              <div className="pbar"><div className="pbar-fill" style={{ width: `${enroll.progress}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
