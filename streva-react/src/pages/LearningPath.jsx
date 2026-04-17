import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CAT_META } from '../data';

export default function LearningPath() {
  const { navigate, courses, learningPath, addToPath, removeFromPath, updatePathItem, showToast } = useApp();
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  // Derive live status from enrollment progress in courses
  const enrichedPath = learningPath.map(item => {
    const live = courses.find(c => c.id === item.id);
    if (!live) return item;
    const status = live.status === 'completed' ? 'done'
      : live.status === 'in-progress' ? 'current'
      : item.status || 'locked';
    return { ...item, status, progress: live.progress || 0, duration: live.duration || item.duration };
  });

  const completed = enrichedPath.filter(i => i.status === 'done').length;
  const totalXp = enrichedPath.reduce((s, i) => s + (i.xp || 0), 0);

  // Courses not yet in path
  const notInPath = courses.filter(c => !learningPath.find(p => p.id === c.id));
  const filtered = notInPath.filter(c =>
    !search || (c.title + (c.desc || '')).toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToPath = (course) => {
    addToPath(course);
    showToast(`"${course.title}" added to your path 🗺️`);
  };

  const handleRemove = (courseId, title) => {
    removeFromPath(courseId);
    showToast(`"${title}" removed from path`);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>Learning Path</h2>
          <p style={{ fontSize: '.83rem', color: 'var(--text3)', marginTop: 3 }}>Your personalized roadmap — add courses to build your curriculum</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowPicker(true)}>+ Add Course to Path</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 22 }}>
        {/* Timeline */}
        <div className="path-tl">
          {enrichedPath.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon">🗺️</div>
              <div className="es-title">Your path is empty</div>
              <div className="es-sub">Click "+ Add Course to Path" to start building your learning roadmap.</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => setShowPicker(true)}>
                + Add Course to Path
              </button>
            </div>
          ) : enrichedPath.map((item, i) => {
            const meta = CAT_META[item.cat] || CAT_META.network;
            const dotClass = item.status === 'done' ? 'done' : item.status === 'current' ? 'current' : 'locked';
            return (
              <div key={item.id} className="path-item">
                <div className="path-dot-col">
                  <div className={`path-dot ${dotClass}`} />
                  {i < enrichedPath.length - 1 && <div className="path-line" />}
                </div>
                <div className={`path-content ${dotClass}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.9rem' }}>
                      {meta.icon} {item.title}
                    </div>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                      {item.status === 'done' && <span className="pill pill-teal" style={{ fontSize: '.62rem' }}>✓ Completed</span>}
                      {item.status === 'current' && <span className="pill pill-purple" style={{ fontSize: '.62rem' }}>▶ In Progress</span>}
                      {item.status === 'locked' && <span className="pill pill-gray" style={{ fontSize: '.62rem' }}>📋 Not Started</span>}
                      <button
                        className="btn btn-danger btn-xs"
                        title="Remove from path"
                        onClick={() => handleRemove(item.id, item.title)}
                        style={{ opacity: 0.7 }}
                      >✕</button>
                    </div>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text3)', marginBottom: 10 }}>
                    {item.desc || item.description || ''}
                  </div>
                  {item.progress > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div className="pbar mb-1"><div className="pbar-fill" style={{ width: `${item.progress}%` }} /></div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{item.progress}% complete</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.73rem', color: 'var(--text3)' }}>
                    <span>⏱ {item.duration || '–'}</span>
                    <span style={{ color: 'var(--gold)' }}>+{item.xp || 200} XP</span>
                    <button
                      className="btn btn-primary btn-xs"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => navigate('course-detail', item.id)}
                    >
                      {item.status === 'done' ? 'Review' : item.status === 'current' ? 'Continue' : 'Start'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div>
          <div className="ai-card mb-16">
            <div className="ai-hd"><div className="ai-star">✦</div><span>Path Optimizer</span></div>
            <p>Build your path by adding courses. Complete them in order to unlock the next step and earn XP.</p>
            <div className="ai-tags">
              <span className="ai-tag">{enrichedPath.length} courses</span>
              <span className="ai-tag">{totalXp} XP total</span>
            </div>
            <button className="ai-btn" onClick={() => setShowPicker(true)}>✦ Add More Courses</button>
          </div>
          <div className="card">
            <h5 style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: 12 }}>Path Stats</h5>
            <div style={{ fontSize: '.8rem', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed</span>
                <strong style={{ color: 'var(--accent)' }}>{completed} / {enrichedPath.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total XP</span>
                <strong style={{ color: 'var(--gold)' }}>{totalXp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>In Progress</span>
                <strong style={{ color: 'var(--primary-l)' }}>
                  {enrichedPath.filter(i => i.status === 'current').length}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Not Started</span>
                <strong>{enrichedPath.filter(i => i.status === 'locked').length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Picker Modal */}
      {showPicker && (
        <div className="mo" onClick={() => setShowPicker(false)}>
          <div className="modal" style={{ maxWidth: 560, width: '95vw', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div>
                <div className="mt">🗺️ Add Course to Path</div>
                <div className="ms">Choose a course to add to your learning roadmap</div>
              </div>
              <div className="mc" onClick={() => setShowPicker(false)}>✕</div>
            </div>
            <div className="mb">
              <div className="search-wrap" style={{ marginBottom: 14 }}>
                <span style={{ color: 'var(--text3)', fontSize: '.85rem' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search courses…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {filtered.length === 0 ? (
                <div className="empty-state" style={{ padding: '28px 0' }}>
                  <div className="es-icon">📚</div>
                  <div className="es-title">{notInPath.length === 0 ? 'All courses added!' : 'No matches'}</div>
                  <div className="es-sub">
                    {notInPath.length === 0
                      ? 'All your courses are already in the path.'
                      : 'Try a different search term.'}
                  </div>
                </div>
              ) : filtered.map(c => {
                const meta = CAT_META[c.cat] || CAT_META.network;
                return (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10,
                    border: '1px solid var(--border2)', marginBottom: 8,
                    background: 'var(--surface2)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: meta.color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.1rem',
                    }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '.73rem', color: 'var(--text3)' }}>
                        {c.level} · {c.duration} · {c.instructor || 'No instructor'}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => { handleAddToPath(c); setSearch(''); }}
                    >+ Add</button>
                  </div>
                );
              })}
              {courses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '.83rem', color: 'var(--text3)' }}>
                  No courses yet.{' '}
                  <span className="link" onClick={() => { setShowPicker(false); navigate('courses'); }}>
                    Create a course first →
                  </span>
                </div>
              )}
            </div>
            <div className="mf">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPicker(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
