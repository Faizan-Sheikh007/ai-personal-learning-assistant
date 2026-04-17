import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CAT_META } from '../data';

// ─── Content Viewer ────────────────────────────────────────────────────────────
function ContentViewer({ item, onDone, isDone }) {
  if (!item) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--text3)', gap: 12 }}>
      <div style={{ fontSize: '3rem' }}>👈</div>
      <div>Select a chapter item to start learning</div>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>{item.title}</h3>
        {!isDone && (
          <button className="btn btn-accent btn-sm" onClick={onDone}>✓ Mark as Done</button>
        )}
        {isDone && <span className="pill pill-teal">✓ Completed</span>}
      </div>

      {item.content_type === 'note' && (
        <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 24, lineHeight: 1.8, fontSize: '.88rem', color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>
          {item.text_content || 'No content added yet.'}
        </div>
      )}

      {item.content_type === 'video' && item.file_url && (
        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <video controls style={{ width: '100%', maxHeight: 420 }} src={item.file_url}>
            Your browser does not support video playback.
          </video>
        </div>
      )}

      {item.content_type === 'video' && !item.file_url && (
        <div style={{ borderRadius: 12, background: 'var(--surface2)', padding: 40, textAlign: 'center', color: 'var(--text3)' }}>🎬 Video not available</div>
      )}

      {item.content_type === 'pdf' && item.file_url && (
        <div style={{ borderRadius: 12, overflow: 'hidden', height: 620, background: 'var(--surface2)', display: 'flex', flexDirection: 'column' }}>
          {/* <object> avoids ERR_BLOCKED_BY_RESPONSE that <iframe> triggers on 127.0.0.1 */}
          <object
            data={item.file_url}
            type="application/pdf"
            style={{ width: '100%', flex: 1, border: 'none' }}
            title={item.title}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>📄</div>
              <p style={{ color: 'var(--text2)', fontSize: '.88rem' }}>
                Your browser blocked the inline preview.<br />
                Click below to open the PDF directly.
              </p>
              <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                🔗 Open PDF
              </a>
              <a href={item.file_url} download className="btn btn-sm" style={{ background: 'var(--surface3)', color: 'var(--text2)' }}>
                ⬇ Download PDF
              </a>
            </div>
          </object>
        </div>
      )}

      {item.content_type === 'pdf' && !item.file_url && (
        <div style={{ borderRadius: 12, background: 'var(--surface2)', padding: 40, textAlign: 'center', color: 'var(--text3)' }}>📄 PDF not available</div>
      )}

      {item.content_type === 'image' && item.file_url && (
        <div style={{ borderRadius: 12, overflow: 'hidden', textAlign: 'center', background: 'var(--surface2)', padding: 16 }}>
          <img src={item.file_url} alt={item.title} style={{ maxWidth: '100%', maxHeight: 480, borderRadius: 8, objectFit: 'contain' }} />
        </div>
      )}

      {item.content_type === 'link' && (
        <div style={{ borderRadius: 12, background: 'var(--surface2)', padding: 24 }}>
          <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 16 }}>External resource:</p>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            🔗 Open Link
          </a>
          <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--text3)', wordBreak: 'break-all' }}>{item.url}</div>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Player ───────────────────────────────────────────────────────────────
function QuizPlayer({ quizzes, courseId, enrollmentId, completedContentIds }) {
  const { submitQuizAnswer, showToast } = useApp();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});   // {quizId: chosen}
  const [results, setResults] = useState({});   // {quizId: {is_correct, correct_answer, explanation}}
  const [submitting, setSubmitting] = useState(false);

  if (!quizzes || quizzes.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>✏️</div>
        <div>No quiz questions for this chapter yet.</div>
      </div>
    );
  }

  const q = quizzes[current];
  const chosen = answers[q.id];
  const result = results[q.id];
  const allDone = Object.keys(results).length === quizzes.length;
  const score = Object.values(results).filter(r => r.is_correct).length;

  const handleSubmit = async () => {
    if (chosen === undefined) { showToast('Please select an answer', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await submitQuizAnswer(q.id, chosen);
      setResults(prev => ({ ...prev, [q.id]: res }));
    } catch (e) {
      showToast(e.message || 'Submit failed', 'error');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: '.8rem', color: 'var(--text3)' }}>Question {current + 1} of {quizzes.length}</div>
        {allDone && (
          <div className="pill pill-teal">Score: {score}/{quizzes.length}</div>
        )}
      </div>

      {/* Progress bar */}
      <div className="pbar" style={{ marginBottom: 20 }}>
        <div className="pbar-fill" style={{ width: `${((current + 1) / quizzes.length) * 100}%` }} />
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 20, lineHeight: 1.5 }}>
        {q.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {(q.options || []).map((opt, i) => {
          let bg = 'var(--surface2)';
          let border = 'var(--border2)';
          if (chosen === i && !result) { bg = 'rgba(108,71,255,.15)'; border = 'var(--primary)'; }
          if (result) {
            if (i === result.correct_answer) { bg = 'rgba(0,217,166,.15)'; border = 'var(--accent)'; }
            else if (i === chosen && !result.is_correct) { bg = 'rgba(255,80,80,.12)'; border = '#ff5050'; }
          }
          return (
            <div key={i}
              onClick={() => !result && setAnswers(prev => ({ ...prev, [q.id]: i }))}
              style={{ padding: '12px 16px', borderRadius: 10, border: `2px solid ${border}`, background: bg, cursor: result ? 'default' : 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .2s' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </div>
              <span style={{ flex: 1 }}>{opt}</span>
              {result && i === result.correct_answer && <span style={{ color: 'var(--accent)' }}>✓</span>}
              {result && i === chosen && !result.is_correct && i !== result.correct_answer && <span style={{ color: '#ff5050' }}>✗</span>}
            </div>
          );
        })}
      </div>

      {result?.explanation && (
        <div style={{ background: 'rgba(108,71,255,.08)', border: '1px solid rgba(108,71,255,.25)', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: '.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--primary-l)' }}>💡 Explanation:</strong> {result.explanation}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {!result && (
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting || chosen === undefined}>
            {submitting ? 'Checking…' : 'Submit Answer'}
          </button>
        )}
        {result && current < quizzes.length - 1 && (
          <button className="btn btn-primary btn-sm" onClick={() => setCurrent(c => c + 1)}>
            Next Question →
          </button>
        )}
        {result && current > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(c => c - 1)}>← Previous</button>
        )}
      </div>

      {allDone && (
        <div style={{ marginTop: 20, padding: 20, borderRadius: 14, background: score === quizzes.length ? 'rgba(0,217,166,.12)' : 'rgba(108,71,255,.08)', border: `1px solid ${score === quizzes.length ? 'var(--accent)' : 'var(--primary)'}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>{score === quizzes.length ? '🏆' : score >= quizzes.length / 2 ? '👏' : '📚'}</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>
            {score === quizzes.length ? 'Perfect Score!' : score >= quizzes.length / 2 ? 'Good Job!' : 'Keep Practicing!'}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: '.85rem' }}>You got {score} out of {quizzes.length} correct</div>
        </div>
      )}
    </div>
  );
}

// ─── Main CourseDetail ─────────────────────────────────────────────────────────
export default function CourseDetail() {
  const { courses, selectedCourseId, navigate, getCourseFullContent, enrollInCourse, markContentDone, addChapter, addContent, addQuiz, deleteChapter, deleteContent, deleteQuiz, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('cd-overview');
  const [courseContent, setCourseContent] = useState(null); // full content from API
  const [loadingContent, setLoadingContent] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // {type:'content'|'quiz', data, chapterId}
  const [enrollment, setEnrollment] = useState(null);
  const [learningMode, setLearningMode] = useState(false); // show the sidebar content player
  const [enrolling, setEnrolling] = useState(false);
  const [openChapters, setOpenChapters] = useState({});

  // Add chapter modal state (within existing course)
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: '', description: '' });
  const [addingContentFor, setAddingContentFor] = useState(null);
  const [contentForm, setContentForm] = useState({ content_type: 'note', title: '', text_content: '', url: '', file: null });
  const [addingQuizFor, setAddingQuizFor] = useState(null);
  const [quizForm, setQuizForm] = useState({ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' });

  const course = courses.find(c => c.id === selectedCourseId) || courses[0];
  const courseId = course?.id;

  // Load full content — hook must be before any early return
  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      setLoadingContent(true);
      try {
        const data = await getCourseFullContent(courseId);
        setCourseContent(data);
        setEnrollment(data.enrollment);
        if (data.chapters?.length > 0) {
          setOpenChapters({ 0: true });
        }
      } catch (e) {
        console.error('Content load error', e);
      }
      setLoadingContent(false);
    };
    load();
  }, [courseId]);

  if (!course) return null;

  const meta = CAT_META[course.cat] || CAT_META.network;

  const handleContinue = async () => {
    if (!enrollment) {
      setEnrolling(true);
      try {
        const enroll = await enrollInCourse(course.id);
        setEnrollment(enroll);
        showToast('Enrolled! 🎉');
      } catch (e) {
        showToast(e.message || 'Enrollment failed', 'error');
      }
      setEnrolling(false);
    }
    setLearningMode(true);
    setActiveTab('cd-curriculum');
  };

  const handleMarkDone = async (item) => {
    if (!enrollment?.id || !item?.data?.id) return;
    try {
      const updated = await markContentDone(enrollment.id, item.data.id);
      setEnrollment(updated);
      showToast('Content marked as done! +XP');
    } catch (e) {
      showToast(e.message || 'Error', 'error');
    }
  };

  const completedIds = enrollment?.completed_content_ids || [];

  // ── Add chapter to existing course ──────────────────────────────
  const handleAddChapter = async () => {
    if (!newChapter.title.trim()) return;
    try {
      const ch = await addChapter(course.id, { title: newChapter.title, description: newChapter.description, order: (courseContent?.chapters?.length || 0) });
      setCourseContent(prev => ({ ...prev, chapters: [...(prev?.chapters || []), { ...ch, contents: [], quizzes: [] }] }));
      setNewChapter({ title: '', description: '' });
      setShowAddChapter(false);
      showToast('Chapter added!');
    } catch (e) { showToast(e.message || 'Error', 'error'); }
  };

  // ── Add content to a chapter ─────────────────────────────────────
  const handleAddContent = async (chapterId) => {
    if (!contentForm.title.trim()) return;
    try {
      const created = await addContent(chapterId, contentForm);
      setCourseContent(prev => ({
        ...prev,
        chapters: prev.chapters.map(ch => ch.id === chapterId
          ? { ...ch, contents: [...ch.contents, created] }
          : ch
        ),
      }));
      setContentForm({ content_type: 'note', title: '', text_content: '', url: '', file: null });
      setAddingContentFor(null);
      showToast('Content added!');
    } catch (e) { showToast(e.message || 'Error', 'error'); }
  };

  // ── Add quiz question ────────────────────────────────────────────
  const handleAddQuiz = async (chapterId) => {
    if (!quizForm.question.trim()) return;
    try {
      const created = await addQuiz({
        course: course.id,
        chapter: chapterId,
        question: quizForm.question,
        options: quizForm.options.filter(o => o.trim()),
        correct_answer: quizForm.correct_answer,
        explanation: quizForm.explanation,
      });
      setCourseContent(prev => ({
        ...prev,
        chapters: prev.chapters.map(ch => ch.id === chapterId
          ? { ...ch, quizzes: [...ch.quizzes, created] }
          : ch
        ),
      }));
      setQuizForm({ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' });
      setAddingQuizFor(null);
      showToast('Quiz question added!');
    } catch (e) { showToast(e.message || 'Error', 'error'); }
  };

  const CONTENT_ICONS = { video: '🎬', note: '📝', pdf: '📄', image: '🖼', link: '🔗' };

  // ─── Learning Mode Layout ──────────────────────────────────────────
  if (learningMode) {
    return (
      <div>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '10px 0', borderBottom: '1px solid var(--border2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ghost btn-xs" onClick={() => setLearningMode(false)}>← Back</button>
            <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{course.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {enrollment && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="pbar" style={{ width: 120 }}>
                  <div className="pbar-fill" style={{ width: `${enrollment.progress || course.progress || 0}%` }} />
                </div>
                <span style={{ fontSize: '.78rem', color: 'var(--text3)' }}>{enrollment.progress || course.progress || 0}%</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, minHeight: 600 }}>
          {/* Left: chapter/content list */}
          <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border2)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border2)', fontSize: '.82rem', fontWeight: 700, color: 'var(--text2)' }}>
              📚 Course Content
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 580 }}>
              {loadingContent && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: '.82rem' }}>Loading…</div>}
              {!loadingContent && (!courseContent?.chapters?.length) && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: '.82rem' }}>No chapters yet</div>
              )}
              {(courseContent?.chapters || []).map((ch, chIdx) => (
                <div key={ch.id}>
                  <div
                    onClick={() => setOpenChapters(p => ({ ...p, [chIdx]: !p[chIdx] }))}
                    style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: openChapters[chIdx] ? 'var(--surface2)' : 'transparent', borderBottom: '1px solid var(--border2)', fontSize: '.83rem', fontWeight: 600 }}>
                    <span>📂 {ch.title}</span>
                    <span style={{ color: 'var(--text3)', fontSize: '.7rem' }}>{openChapters[chIdx] ? '▲' : '▼'}</span>
                  </div>
                  {openChapters[chIdx] && (
                    <div>
                      {(ch.contents || []).map(item => {
                        const isDone = completedIds.includes(item.id);
                        const isActive = selectedItem?.data?.id === item.id && selectedItem?.type === 'content';
                        return (
                          <div key={item.id}
                            onClick={() => setSelectedItem({ type: 'content', data: item, chapterId: ch.id })}
                            style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.78rem', background: isActive ? 'rgba(108,71,255,.1)' : 'transparent', borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all .2s' }}>
                            <span>{CONTENT_ICONS[item.content_type] || '📌'}</span>
                            <span style={{ flex: 1 }}>{item.title}</span>
                            {isDone && <span style={{ color: 'var(--accent)', fontSize: '.7rem' }}>✓</span>}
                          </div>
                        );
                      })}
                      {(ch.quizzes || []).length > 0 && (
                        <div
                          onClick={() => setSelectedItem({ type: 'quiz', data: ch.quizzes, chapterId: ch.id })}
                          style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.78rem', background: selectedItem?.type === 'quiz' && selectedItem?.chapterId === ch.id ? 'rgba(108,71,255,.1)' : 'transparent', borderLeft: selectedItem?.type === 'quiz' && selectedItem?.chapterId === ch.id ? '3px solid var(--primary)' : '3px solid transparent' }}>
                          <span>✏️</span>
                          <span style={{ flex: 1 }}>Chapter Quiz ({ch.quizzes.length} Qs)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: content viewer */}
          <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border2)' }}>
            {selectedItem?.type === 'content' && (
              <ContentViewer
                item={selectedItem.data}
                isDone={completedIds.includes(selectedItem.data.id)}
                onDone={() => handleMarkDone(selectedItem)}
              />
            )}
            {selectedItem?.type === 'quiz' && (
              <div>
                <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border2)', fontWeight: 700, fontSize: '.9rem' }}>
                  ✏️ Chapter Quiz
                </div>
                <QuizPlayer
                  quizzes={selectedItem.data}
                  courseId={course.id}
                  enrollmentId={enrollment?.id}
                  completedContentIds={completedIds}
                />
              </div>
            )}
            {!selectedItem && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--text3)', gap: 12 }}>
                <div style={{ fontSize: '3rem' }}>👈</div>
                <div style={{ fontSize: '.88rem' }}>Select a lesson from the sidebar to start</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Normal Course Detail Layout ──────────────────────────────────────────
  return (
    <div>
      <div className="cd-hero">
        <div className="cd-breadcrumb">
          <a onClick={() => navigate('courses')}>My Courses</a>
          <span>›</span>
          <span>{course.title}</span>
        </div>
        <div className="cd-title">{course.title}</div>
        <div className="cd-subtitle">{course.desc || course.description}</div>
        <div className="cd-meta-row">
          <div className="cd-meta-item">
            <div className="cd-stars">★★★★★</div>
            <strong style={{ marginLeft: 4 }}>{course.rating || '0.0'}</strong>
          </div>
          <div className="cd-meta-item">👥 {(course.students || 0).toLocaleString()} students</div>
          <div className="cd-meta-item">⏱ {course.duration}</div>
          {courseContent?.chapters?.length > 0 && <div className="cd-meta-item">📚 {courseContent.chapters.length} chapters</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <div className="cd-meta-item">👤 {course.instructor}</div>
          <span className={`pill ${meta.pill}`}>{course.level}</span>
          <span className="pill pill-purple">{meta.label}</span>
        </div>
        {course.progress > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div className="pbar" style={{ height: 6, maxWidth: 300 }}>
              <div className="pbar-fill" style={{ width: `${course.progress}%` }} />
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: 4 }}>{course.progress}% complete</div>
          </div>
        )}
        <div className="cd-enroll-bar">
          <button className="btn btn-accent" onClick={handleContinue} disabled={enrolling}>
            {enrolling ? '…' : '▶ Continue Learning'}
          </button>
          <button className="btn btn-ghost btn-sm">↗ Share</button>
          <button className="btn btn-ghost btn-sm">🔖 Save</button>
        </div>
      </div>

      <div className="cd-body">
        <div className="cd-main">
          <div className="cd-tabs">
            {[['cd-overview', 'Overview'], ['cd-curriculum', 'Curriculum'], ['cd-reviews', 'Reviews'], ['cd-discussion', 'Discussion']].map(([id, lbl]) => (
              <div key={id} className={`cd-tab${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}>{lbl}</div>
            ))}
          </div>

          {activeTab === 'cd-overview' && (
            <div>
              <div className="card mb-16">
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 10 }}>About This Course</h4>
                <p style={{ fontSize: '.84rem', color: 'var(--text2)', lineHeight: 1.75 }}>{course.desc || course.description}</p>
              </div>
              <div className="card">
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>AI Learning Insights</h4>
                <div className="ai-card" style={{ borderRadius: 'var(--r)' }}>
                  <div className="ai-hd"><div className="ai-star">✦</div><span>Personalized for you</span></div>
                  <p>AI predicts you'll complete this course based on your current pace. Focus on weaker areas first.</p>
                  <div className="ai-tags"><span className="ai-tag">↑ High completion probability</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cd-curriculum' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: '.83rem', color: 'var(--text2)' }}>
                  {courseContent?.chapters?.length || 0} chapters
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddChapter(true)}>+ Add Chapter</button>
              </div>

              {loadingContent && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>Loading content…</div>}

              {!loadingContent && (!courseContent?.chapters?.length) && (
                <div className="empty-state">
                  <div className="es-icon">📂</div>
                  <div className="es-title">No chapters yet</div>
                  <div className="es-sub">Add chapters to organize your course content.</div>
                </div>
              )}

              {(courseContent?.chapters || []).map((ch, chIdx) => (
                <div key={ch.id} className="curr-section">
                  <div className="curr-section-hd" onClick={() => setOpenChapters(p => ({ ...p, [chIdx]: !p[chIdx] }))}>
                    <h5>📂 {ch.title}</h5>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '.73rem', color: 'var(--text3)' }}>
                      <span>{ch.contents?.length || 0} items</span>
                      {ch.quizzes?.length > 0 && <span>✏️ {ch.quizzes.length} quiz</span>}
                      <span>{openChapters[chIdx] ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {openChapters[chIdx] && (
                    <div className="curr-section-body">
                      {(ch.contents || []).map(item => (
                        <div key={item.id} className="curr-lesson">
                          <span className="lesson-icon">{CONTENT_ICONS[item.content_type] || '📌'}</span>
                          <span style={{ flex: 1, fontSize: '.82rem' }}>{item.title}</span>
                          <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{item.content_type}</span>
                        </div>
                      ))}
                      {(ch.quizzes || []).length > 0 && (
                        <div className="curr-lesson" style={{ background: 'rgba(108,71,255,.05)', borderRadius: 8, padding: '8px 12px' }}>
                          <span className="lesson-icon">✏️</span>
                          <span style={{ flex: 1, fontSize: '.82rem', color: 'var(--primary-l)' }}>Chapter Quiz • {ch.quizzes.length} questions</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, padding: '8px 0', marginTop: 4 }}>
                        <button className="btn btn-ghost btn-xs" onClick={() => { setAddingContentFor(ch.id); setContentForm({ content_type: 'note', title: '', text_content: '', url: '', file: null }); }}>
                          + Add Content
                        </button>
                        <button className="btn btn-ghost btn-xs" onClick={() => { setAddingQuizFor(ch.id); setQuizForm({ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }); }}>
                          + Add Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Chapter inline form */}
              {showAddChapter && (
                <div style={{ border: '1px solid var(--primary)', borderRadius: 12, padding: 16, marginTop: 12 }}>
                  <div className="fg" style={{ marginBottom: 8 }}><label>Chapter Title</label>
                    <input value={newChapter.title} onChange={e => setNewChapter(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to TCP/IP" />
                  </div>
                  <div className="fg" style={{ marginBottom: 12 }}><label>Description (optional)</label>
                    <input value={newChapter.description} onChange={e => setNewChapter(p => ({ ...p, description: e.target.value }))} placeholder="Brief overview" />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleAddChapter}>Add Chapter</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowAddChapter(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cd-reviews' && (
            <div style={{ padding: 10, color: 'var(--text3)', textAlign: 'center' }}>No reviews yet.</div>
          )}

          {activeTab === 'cd-discussion' && (
            <div>
              <div className="card mb-16">
                <div className="fg"><label>Start a discussion</label><textarea placeholder="Ask a question or share your thoughts…" style={{ minHeight: 90 }} /></div>
                <button className="btn btn-primary btn-sm">Post Discussion</button>
              </div>
            </div>
          )}
        </div>

        <div className="cd-sidebar">
          <div className="cd-sticky">
            <div className="cd-card">
              <div className="cd-card-thumb" style={{ background: `linear-gradient(135deg, ${meta.color}, #0d2a4a)` }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>{meta.icon}</div>
                <div className="cd-card-thumb-overlay"><div className="play-btn-lg">▶</div></div>
              </div>
              <div className="cd-card-body">
                <div className="cd-price">Free</div>
                <button className="btn btn-primary" style={{ width: '100%', marginBottom: 8 }} onClick={handleContinue} disabled={enrolling}>
                  {enrolling ? 'Loading…' : '▶ Continue Learning'}
                </button>
                <button className="btn btn-ghost" style={{ width: '100%', fontSize: '.78rem' }}>🔖 Save for Later</button>
                <div className="cd-includes" style={{ marginTop: 16 }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 10 }}>This course includes:</div>
                  {[
                    ['📚', `${courseContent?.chapters?.length || 0} chapters`],
                    ['📄', `${(courseContent?.chapters || []).reduce((a, c) => a + (c.contents?.filter(i => i.content_type === 'pdf').length || 0), 0)} PDF resources`],
                    ['🎬', `${(courseContent?.chapters || []).reduce((a, c) => a + (c.contents?.filter(i => i.content_type === 'video').length || 0), 0)} videos`],
                    ['✏️', `${(courseContent?.chapters || []).reduce((a, c) => a + (c.quizzes?.length || 0), 0)} quiz questions`],
                    ['🏆', 'Certificate of completion'],
                    ['∞', 'Full lifetime access'],
                  ].map(([icon, text]) => (
                    <div key={text} className="cd-include-item"><span>{icon}</span> {text}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Content Modal */}
      {addingContentFor !== null && (
        <div className="mo" onClick={() => setAddingContentFor(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div><div className="mt">Add Content</div></div>
              <div className="mc" onClick={() => setAddingContentFor(null)}>✕</div>
            </div>
            <div className="mb">
              <div className="fg"><label>Content Type</label>
                <select value={contentForm.content_type} onChange={e => setContentForm(p => ({ ...p, content_type: e.target.value }))}>
                  <option value="note">📝 Note / Text</option>
                  <option value="video">🎬 Video</option>
                  <option value="pdf">📄 PDF</option>
                  <option value="image">🖼 Image</option>
                  <option value="link">🔗 External Link</option>
                </select>
              </div>
              <div className="fg"><label>Title</label>
                <input value={contentForm.title} onChange={e => setContentForm(p => ({ ...p, title: e.target.value }))} placeholder="Content title" />
              </div>
              {contentForm.content_type === 'note' && (
                <div className="fg"><label>Text Content</label>
                  <textarea value={contentForm.text_content} onChange={e => setContentForm(p => ({ ...p, text_content: e.target.value }))} rows={5} placeholder="Write notes here…" />
                </div>
              )}
              {contentForm.content_type === 'link' && (
                <div className="fg"><label>URL</label>
                  <input type="url" value={contentForm.url} onChange={e => setContentForm(p => ({ ...p, url: e.target.value }))} placeholder="https://…" />
                </div>
              )}
              {['video', 'pdf', 'image'].includes(contentForm.content_type) && (
                <div className="fg"><label>Upload File</label>
                  <input type="file" accept={contentForm.content_type === 'video' ? 'video/*' : contentForm.content_type === 'pdf' ? 'application/pdf' : 'image/*'}
                    onChange={e => setContentForm(p => ({ ...p, file: e.target.files[0] }))}
                    style={{ padding: 8, background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border2)', color: 'var(--text)' }} />
                  {contentForm.file && <div style={{ fontSize: '.75rem', color: 'var(--accent)', marginTop: 4 }}>✓ {contentForm.file.name}</div>}
                </div>
              )}
            </div>
            <div className="mf">
              <button className="btn btn-ghost btn-sm" onClick={() => setAddingContentFor(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => handleAddContent(addingContentFor)}>Add Content</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Quiz Modal */}
      {addingQuizFor !== null && (
        <div className="mo" onClick={() => setAddingQuizFor(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div><div className="mt">Add Quiz Question</div></div>
              <div className="mc" onClick={() => setAddingQuizFor(null)}>✕</div>
            </div>
            <div className="mb">
              <div className="fg"><label>Question *</label>
                <textarea value={quizForm.question} onChange={e => setQuizForm(p => ({ ...p, question: e.target.value }))} rows={3} placeholder="Enter your question…" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '.8rem', fontWeight: 600, color: 'var(--text2)' }}>Options (select correct)</label>
                {quizForm.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input type="radio" name="correct_q" checked={quizForm.correct_answer === i} onChange={() => setQuizForm(p => ({ ...p, correct_answer: i }))} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                    <input value={opt} onChange={e => setQuizForm(p => { const opts = [...p.options]; opts[i] = e.target.value; return { ...p, options: opts }; })}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      style={{ flex: 1, padding: '7px 12px', borderRadius: 8, border: `1px solid ${quizForm.correct_answer === i ? 'var(--accent)' : 'var(--border2)'}`, background: 'var(--surface2)', color: 'var(--text)', fontSize: '.83rem' }} />
                  </div>
                ))}
              </div>
              <div className="fg"><label>Explanation</label>
                <textarea value={quizForm.explanation} onChange={e => setQuizForm(p => ({ ...p, explanation: e.target.value }))} rows={2} placeholder="Why is this correct?" />
              </div>
            </div>
            <div className="mf">
              <button className="btn btn-ghost btn-sm" onClick={() => setAddingQuizFor(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => handleAddQuiz(addingQuizFor)}>Add Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
