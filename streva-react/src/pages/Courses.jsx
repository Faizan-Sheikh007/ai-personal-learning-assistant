import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CAT_META } from '../data';

function CourseCard({ course, onOpen }) {
  const meta = CAT_META[course.cat] || CAT_META.network;
  const { addToPath, removeFromPath, learningPath, showToast } = useApp();
  const inPath = learningPath?.some(p => p.id === course.id);
  const statusPill = course.status === 'completed'
    ? <span className="pill pill-teal">✓ Completed</span>
    : course.status === 'in-progress'
    ? <span className="pill pill-purple">▶ In Progress</span>
    : <span className="pill pill-gray">Not Started</span>;

  return (
    <div className="course-card" onClick={() => onOpen(course.id)}>
      <div className="cc-thumb">
        <div className="cc-thumb-bg" style={{ background: meta.color }} />
        <div className="cc-overlay" />
        <h4>{course.title}</h4>
        <div className="cc-badge">{statusPill}</div>
      </div>
      <div className="cc-body">
        <div className="cc-meta">
          <div className="cc-author">{meta.icon} {course.instructor}</div>
          {course.rating > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.72rem', color: 'var(--gold)' }}>★ {course.rating}</div>}
        </div>
        <div className="cc-desc">{course.desc || course.description}</div>
        <div className="cc-stats">
          {course.students > 0 && <span>👥 {course.students >= 1000 ? (course.students / 1000).toFixed(1) + 'k' : course.students}</span>}
          <span>⏱ {course.duration}</span>
          {course.chapter_count > 0 && <span>📚 {course.chapter_count} chapters</span>}
          {course.quiz_count > 0 && <span>✏️ {course.quiz_count} quizzes</span>}
        </div>
        {course.progress > 0 && (
          <>
            <div className="pbar mb-1"><div className="pbar-fill" style={{ width: `${course.progress}%` }} /></div>
            <div className="cc-progress-label">{course.progress}% complete</div>
          </>
        )}
        <div className="cc-footer">
          <span className={`pill ${meta.pill}`} style={{ fontSize: '.62rem' }}>{course.level}</span>
          <button
            className={inPath ? "btn btn-ghost btn-xs" : "btn btn-ghost btn-xs"}
            title={inPath ? "Remove from path" : "Add to learning path"}
            onClick={e => {
              e.stopPropagation();
              if (inPath) { removeFromPath(course.id); showToast(); }
              else { addToPath(course); showToast(); }
            }}
            style={{ fontSize: '.68rem', opacity: inPath ? 1 : 0.75 }}
          >{inPath ? '✓ In Path' : '+ Path'}</button>
          <button className="btn btn-primary btn-xs" onClick={e => { e.stopPropagation(); onOpen(course.id); }}>
            {course.progress > 0 ? 'Continue' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Course Modal ──────────────────────────────────────────────────────────
function AddCourseModal({ onClose, onCreated }) {
  const { addCourse, addChapter, addContent, addQuiz, showToast } = useApp();

  const [step, setStep] = useState(1); // 1=basic info, 2=chapters, 3=done
  const [saving, setSaving] = useState(false);
  const [createdCourse, setCreatedCourse] = useState(null);

  // Step 1 — Basic Info
  const [info, setInfo] = useState({
    title: '', cat: 'network', level: 'Beginner',
    desc: '', instructor: '', duration: '1h',
  });

  // Step 2 — Chapters
  const [chapters, setChapters] = useState([]); // local state before saving
  const [editingChapter, setEditingChapter] = useState(null); // {title, desc}
  const [showChapterForm, setShowChapterForm] = useState(false);

  // Content within a chapter (by chapter index)
  const [contentByChapter, setContentByChapter] = useState({}); // {chIdx: [{type,title,file/url/text}]}
  const [quizzesByChapter, setQuizzesByChapter] = useState({});  // {chIdx: [{question,options[4],correct,explanation}]}

  // Content form
  const [addingContentFor, setAddingContentFor] = useState(null); // chapter index
  const [contentForm, setContentForm] = useState({ content_type: 'note', title: '', text_content: '', url: '', file: null });

  // Quiz form
  const [addingQuizFor, setAddingQuizFor] = useState(null);
  const [quizForm, setQuizForm] = useState({ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' });

  const setInfoField = (k, v) => setInfo(p => ({ ...p, [k]: v }));

  // ── Chapter helpers ──────────────────────────────────────────────
  const saveChapter = () => {
    if (!editingChapter?.title?.trim()) return;
    setChapters(prev => [...prev, { title: editingChapter.title, description: editingChapter.desc || '' }]);
    setEditingChapter(null);
    setShowChapterForm(false);
  };

  const removeChapter = (idx) => {
    setChapters(prev => prev.filter((_, i) => i !== idx));
    setContentByChapter(prev => { const n = { ...prev }; delete n[idx]; return n; });
    setQuizzesByChapter(prev => { const n = { ...prev }; delete n[idx]; return n; });
  };

  // ── Content helpers ──────────────────────────────────────────────
  const saveContent = () => {
    if (!contentForm.title.trim()) return;
    setContentByChapter(prev => ({
      ...prev,
      [addingContentFor]: [...(prev[addingContentFor] || []), { ...contentForm }],
    }));
    setContentForm({ content_type: 'note', title: '', text_content: '', url: '', file: null });
    setAddingContentFor(null);
  };

  // ── Quiz helpers ─────────────────────────────────────────────────
  const saveQuiz = () => {
    if (!quizForm.question.trim()) return;
    setQuizzesByChapter(prev => ({
      ...prev,
      [addingQuizFor]: [...(prev[addingQuizFor] || []), { ...quizForm }],
    }));
    setQuizForm({ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' });
    setAddingQuizFor(null);
  };

  const removeQuiz = (chIdx, qIdx) => {
    setQuizzesByChapter(prev => ({
      ...prev,
      [chIdx]: (prev[chIdx] || []).filter((_, i) => i !== qIdx),
    }));
  };

  const removeContent = (chIdx, cIdx) => {
    setContentByChapter(prev => ({
      ...prev,
      [chIdx]: (prev[chIdx] || []).filter((_, i) => i !== cIdx),
    }));
  };

  // ── Step 1 → save course ─────────────────────────────────────────
  const handleCreateCourse = async () => {
    if (!info.title.trim()) { showToast('Course title required', 'error'); return; }
    setSaving(true);
    try {
      const course = await addCourse(info);
      setCreatedCourse(course);
      setStep(2);
    } catch (e) {
      showToast(e.message || 'Failed to create course', 'error');
    }
    setSaving(false);
  };

  // ── Step 2 → save chapters, content, quizzes ─────────────────────
  const handleSaveAll = async () => {
    if (!createdCourse) return;
    setSaving(true);
    try {
      for (let i = 0; i < chapters.length; i++) {
        const ch = await addChapter(createdCourse.id, {
          title: chapters[i].title,
          description: chapters[i].description,
          order: i,
        });
        // Save content
        const contents = contentByChapter[i] || [];
        for (let j = 0; j < contents.length; j++) {
          await addContent(ch.id, { ...contents[j], order: j });
        }
        // Save quizzes
        const quizzes = quizzesByChapter[i] || [];
        for (let j = 0; j < quizzes.length; j++) {
          await addQuiz({
            course: createdCourse.id,
            chapter: ch.id,
            question: quizzes[j].question,
            options: quizzes[j].options.filter(o => o.trim()),
            correct_answer: quizzes[j].correct_answer,
            explanation: quizzes[j].explanation || '',
            order: j,
          });
        }
      }
      showToast('Course created with all content! 🎉');
      onCreated(createdCourse);
    } catch (e) {
      showToast(e.message || 'Error saving content', 'error');
    }
    setSaving(false);
  };

  const CONTENT_ICONS = { video: '🎬', note: '📝', pdf: '📄', image: '🖼', link: '🔗' };

  return (
    <div className="mo" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="mh">
          <div>
            <div className="mt">{step === 1 ? '📚 Create Course' : '🗂 Add Chapters & Content'}</div>
            <div className="ms">
              {step === 1 ? 'Fill in course details to get started' : `${createdCourse?.title} — add chapters, content & quizzes`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2].map(s => (
                <div key={s} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step >= s ? 'var(--primary)' : 'var(--surface2)',
                  color: step >= s ? '#fff' : 'var(--text3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.75rem', fontWeight: 700,
                }}>{s}</div>
              ))}
            </div>
            <div className="mc" onClick={onClose}>✕</div>
          </div>
        </div>

        {/* ── STEP 1: Basic Info ── */}
        {step === 1 && (
          <div className="mb">
            <div className="fg"><label>Course Title *</label>
              <input value={info.title} onChange={e => setInfoField('title', e.target.value)} placeholder="e.g. Advanced Network Security" />
            </div>
            <div className="frow">
              <div className="fg"><label>Category</label>
                <select value={info.cat} onChange={e => setInfoField('cat', e.target.value)}>
                  {Object.entries(CAT_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="fg"><label>Level</label>
                <select value={info.level} onChange={e => setInfoField('level', e.target.value)}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label>Description</label>
              <textarea value={info.desc} onChange={e => setInfoField('desc', e.target.value)} placeholder="What will students learn?" rows={3} />
            </div>
            <div className="frow">
              <div className="fg"><label>Instructor Name</label>
                <input value={info.instructor} onChange={e => setInfoField('instructor', e.target.value)} placeholder="e.g. Dr. Sarah Chen" />
              </div>
              <div className="fg"><label>Duration</label>
                <input value={info.duration} onChange={e => setInfoField('duration', e.target.value)} placeholder="e.g. 4h" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Chapters, Content, Quizzes ── */}
        {step === 2 && (
          <div className="mb">
            {/* Chapters list */}
            {chapters.map((ch, chIdx) => (
              <div key={chIdx} style={{ border: '1px solid var(--border2)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: '.9rem' }}>📂 {ch.title}</div>
                  <button className="btn btn-danger btn-xs" onClick={() => removeChapter(chIdx)}>✕ Remove</button>
                </div>
                {ch.description && <div style={{ fontSize: '.78rem', color: 'var(--text3)', marginBottom: 10 }}>{ch.description}</div>}

                {/* Content items */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Content</div>
                  {(contentByChapter[chIdx] || []).map((item, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'var(--surface2)', borderRadius: 8, marginBottom: 5, fontSize: '.78rem' }}>
                      <span>{CONTENT_ICONS[item.content_type]}</span>
                      <span style={{ flex: 1 }}>{item.title}</span>
                      <span style={{ color: 'var(--text3)', fontSize: '.7rem' }}>{item.content_type}</span>
                      <button className="btn btn-danger btn-xs" onClick={() => removeContent(chIdx, cIdx)}>✕</button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-xs" style={{ marginTop: 4 }} onClick={() => { setAddingContentFor(chIdx); setContentForm({ content_type: 'note', title: '', text_content: '', url: '', file: null }); }}>
                    + Add Content
                  </button>
                </div>

                {/* Quizzes */}
                <div>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Quizzes</div>
                  {(quizzesByChapter[chIdx] || []).map((q, qIdx) => (
                    <div key={qIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'var(--surface2)', borderRadius: 8, marginBottom: 5, fontSize: '.78rem' }}>
                      <span>✏️</span>
                      <span style={{ flex: 1 }}>{q.question.substring(0, 50)}{q.question.length > 50 ? '…' : ''}</span>
                      <button className="btn btn-danger btn-xs" onClick={() => removeQuiz(chIdx, qIdx)}>✕</button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-xs" style={{ marginTop: 4 }} onClick={() => { setAddingQuizFor(chIdx); setQuizForm({ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }); }}>
                    + Add Quiz Question
                  </button>
                </div>
              </div>
            ))}

            {/* Add chapter button */}
            {!showChapterForm && (
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', border: '2px dashed var(--border2)', borderRadius: 12, padding: 14 }}
                onClick={() => { setShowChapterForm(true); setEditingChapter({ title: '', desc: '' }); }}>
                + Add Chapter
              </button>
            )}

            {/* New chapter form */}
            {showChapterForm && (
              <div style={{ border: '1px solid var(--primary)', borderRadius: 12, padding: 14 }}>
                <div className="fg" style={{ marginBottom: 8 }}>
                  <label>Chapter Title</label>
                  <input value={editingChapter?.title || ''} onChange={e => setEditingChapter(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to TCP/IP" />
                </div>
                <div className="fg" style={{ marginBottom: 10 }}>
                  <label>Description (optional)</label>
                  <input value={editingChapter?.desc || ''} onChange={e => setEditingChapter(p => ({ ...p, desc: e.target.value }))} placeholder="Brief chapter overview" />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={saveChapter}>Add Chapter</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowChapterForm(false); setEditingChapter(null); }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Add Content modal */}
            {addingContentFor !== null && (
              <div className="mo" onClick={() => setAddingContentFor(null)}>
                <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                  <div className="mh">
                    <div><div className="mt">Add Content to Chapter {addingContentFor + 1}</div></div>
                    <div className="mc" onClick={() => setAddingContentFor(null)}>✕</div>
                  </div>
                  <div className="mb">
                    <div className="fg"><label>Content Type</label>
                      <select value={contentForm.content_type} onChange={e => setContentForm(p => ({ ...p, content_type: e.target.value }))}>
                        <option value="note">📝 Note / Text</option>
                        <option value="video">🎬 Video File</option>
                        <option value="pdf">📄 PDF</option>
                        <option value="image">🖼 Image</option>
                        <option value="link">🔗 External Link</option>
                      </select>
                    </div>
                    <div className="fg"><label>Title</label>
                      <input value={contentForm.title} onChange={e => setContentForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction Video" />
                    </div>
                    {contentForm.content_type === 'note' && (
                      <div className="fg"><label>Content</label>
                        <textarea value={contentForm.text_content} onChange={e => setContentForm(p => ({ ...p, text_content: e.target.value }))} rows={5} placeholder="Write your notes here…" />
                      </div>
                    )}
                    {contentForm.content_type === 'link' && (
                      <div className="fg"><label>URL</label>
                        <input type="url" value={contentForm.url} onChange={e => setContentForm(p => ({ ...p, url: e.target.value }))} placeholder="https://…" />
                      </div>
                    )}
                    {['video', 'pdf', 'image'].includes(contentForm.content_type) && (
                      <div className="fg"><label>Upload File</label>
                        <input type="file"
                          accept={contentForm.content_type === 'video' ? 'video/*' : contentForm.content_type === 'pdf' ? 'application/pdf' : 'image/*'}
                          onChange={e => setContentForm(p => ({ ...p, file: e.target.files[0] }))}
                          style={{ padding: 8, background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border2)', color: 'var(--text)' }}
                        />
                        {contentForm.file && <div style={{ fontSize: '.75rem', color: 'var(--accent)', marginTop: 4 }}>✓ {contentForm.file.name}</div>}
                      </div>
                    )}
                  </div>
                  <div className="mf">
                    <button className="btn btn-ghost btn-sm" onClick={() => setAddingContentFor(null)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={saveContent}>Add Content</button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Quiz modal */}
            {addingQuizFor !== null && (
              <div className="mo" onClick={() => setAddingQuizFor(null)}>
                <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
                  <div className="mh">
                    <div><div className="mt">Add Quiz Question</div><div className="ms">Chapter {addingQuizFor + 1}</div></div>
                    <div className="mc" onClick={() => setAddingQuizFor(null)}>✕</div>
                  </div>
                  <div className="mb">
                    <div className="fg"><label>Question *</label>
                      <textarea value={quizForm.question} onChange={e => setQuizForm(p => ({ ...p, question: e.target.value }))} rows={3} placeholder="Enter your question…" />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '.8rem', fontWeight: 600, color: 'var(--text2)' }}>Answer Options (select correct one)</label>
                      {quizForm.options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <input type="radio" name="correct" checked={quizForm.correct_answer === i}
                            onChange={() => setQuizForm(p => ({ ...p, correct_answer: i }))}
                            style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                          <input
                            value={opt}
                            onChange={e => setQuizForm(p => { const opts = [...p.options]; opts[i] = e.target.value; return { ...p, options: opts }; })}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            style={{ flex: 1, padding: '7px 12px', borderRadius: 8, border: `1px solid ${quizForm.correct_answer === i ? 'var(--accent)' : 'var(--border2)'}`, background: 'var(--surface2)', color: 'var(--text)', fontSize: '.83rem' }}
                          />
                          {quizForm.correct_answer === i && <span style={{ color: 'var(--accent)', fontSize: '.8rem' }}>✓ Correct</span>}
                        </div>
                      ))}
                    </div>
                    <div className="fg"><label>Explanation (shown after answer)</label>
                      <textarea value={quizForm.explanation} onChange={e => setQuizForm(p => ({ ...p, explanation: e.target.value }))} rows={2} placeholder="Why is this the correct answer?" />
                    </div>
                  </div>
                  <div className="mf">
                    <button className="btn btn-ghost btn-sm" onClick={() => setAddingQuizFor(null)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={saveQuiz}>Add Question</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mf">
          {step === 1 && <>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleCreateCourse} disabled={saving}>
              {saving ? 'Creating…' : 'Next: Add Chapters →'}
            </button>
          </>}
          {step === 2 && <>
            <button className="btn btn-ghost btn-sm" onClick={() => { onCreated(createdCourse); showToast('Course created (no chapters added)'); }}>
              Skip & Finish
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveAll} disabled={saving}>
              {saving ? 'Saving…' : '✓ Save & Finish'}
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Courses Page ─────────────────────────────────────────────────────────
export default function Courses() {
  const { courses, navigate, showToast, updateCourse } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = courses
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => !search || (c.title + (c.desc || '')).toLowerCase().includes(search.toLowerCase()));

  const handleCreated = (course) => {
    setShowAddModal(false);
    if (course) navigate('course-detail', course.id);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>My Courses</h2>
          <p style={{ fontSize: '.83rem', color: 'var(--text3)', marginTop: 3 }}>Your enrolled learning paths and programs</p>
        </div>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap" style={{ maxWidth: 240 }}>
            <span style={{ color: 'var(--text3)', fontSize: '.85rem' }}>🔍</span>
            <input type="text" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, overflow: 'hidden' }}>
            {[['all', 'All'], ['in-progress', 'In Progress'], ['completed', 'Completed']].map(([val, lbl]) => (
              <button key={val} className="btn btn-xs" style={{ borderRadius: 0, background: filter === val ? 'var(--primary)' : '', color: filter === val ? '#fff' : '' }} onClick={() => setFilter(val)}>{lbl}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>+ Add Course</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="es-icon">📚</div>
          <div className="es-title">No courses found</div>
          <div className="es-sub">Try a different filter or add a new course.</div>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(c => <CourseCard key={c.id} course={c} onOpen={(id) => navigate('course-detail', id)} />)}
        </div>
      )}

      {showAddModal && <AddCourseModal onClose={() => setShowAddModal(false)} onCreated={handleCreated} />}
    </div>
  );
}
