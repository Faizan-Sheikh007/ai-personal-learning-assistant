import React, { useState } from 'react';
import { QUIZ_BANK } from '../data';

export default function Quiz() {
  const [mode, setMode] = useState('home'); // 'home' | 'running' | 'results'
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const q = QUIZ_BANK[current];
  const progress = (current / QUIZ_BANK.length) * 100;

  const startQuiz = () => {
    setCurrent(0); setSelected(null); setRevealed(false); setScore(0);
    setMode('running');
  };

  const checkAnswer = () => { if (selected !== null) setRevealed(true); };

  const nextQuestion = () => {
    const newScore = revealed && selected === q.ans ? score + 1 : score;
    setScore(newScore);
    if (current + 1 >= QUIZ_BANK.length) {
      setScore(newScore);
      setMode('results');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const getOptClass = (i) => {
    if (!revealed) return selected === i ? ' selected' : '';
    if (i === q.ans) return ' correct';
    if (i === selected && selected !== q.ans) return ' wrong';
    return '';
  };

  if (mode === 'home') return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>Assessments</h2>
        <p style={{ fontSize: '.83rem', color: 'var(--text3)', marginTop: 3 }}>Test your knowledge with AI-generated quizzes</p>
      </div>
      <div className="grid-3 mb-24">
        <div className="stat-c" style={{ cursor: 'pointer', border: '1px solid rgba(108,71,255,.3)' }} onClick={startQuiz}>
          <div className="stat-icon">🎯</div>
          <div className="stat-val">{QUIZ_BANK.length}</div>
          <div className="stat-lbl">Network Security Quiz</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 10, width: '100%' }}>Start Quiz</button>
        </div>
        <div className="stat-c">
          <div className="stat-icon">📊</div>
          <div className="stat-val">87%</div>
          <div className="stat-lbl">Best Score</div>
          <div className="stat-delta d-up">Personal Best</div>
        </div>
        <div className="stat-c">
          <div className="stat-icon">✏️</div>
          <div className="stat-val">3</div>
          <div className="stat-lbl">Pending Assessments</div>
          <div className="stat-delta d-down">Due today</div>
        </div>
      </div>
      <div className="ai-card">
        <div className="ai-hd"><div className="ai-star">✦</div><span>AI-Generated Quizzes</span></div>
        <p>Upload your course material and AI will automatically generate personalized quiz questions based on key concepts and your weak areas.</p>
        <div className="ai-tags"><span className="ai-tag">5 questions · Network Security</span><span className="ai-tag warn">Recommended by AI</span></div>
        <button className="ai-btn" onClick={startQuiz}>✦ Start AI Quiz</button>
      </div>
    </div>
  );

  if (mode === 'results') {
    const pct = Math.round((score / QUIZ_BANK.length) * 100);
    return (
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📖'}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', marginBottom: 8 }}>Quiz Complete!</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3rem', color: pct >= 80 ? 'var(--accent)' : pct >= 60 ? 'var(--gold)' : 'var(--accent2)', marginBottom: 4 }}>{pct}%</div>
          <div style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 24 }}>You got {score} out of {QUIZ_BANK.length} correct</div>
          <div style={{ display: 'flex', gap: 9, justifyContent: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={startQuiz}>Retake Quiz</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setMode('home')}>Back to Assessments</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,var(--primary),var(--accent))', borderRadius: 2, transition: '.4s' }} />
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Question {current + 1} of {QUIZ_BANK.length}</span>
          <span className="pill pill-purple">Network Security</span>
          <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--accent)' }}>Score: {score}</span>
        </div>
        <div className="quiz-q">{q.q}</div>
        <div className="qz-opts">
          {q.opts.map((opt, i) => (
            <div
              key={i}
              className={`qz-opt${getOptClass(i)}`}
              onClick={() => !revealed && setSelected(i)}
            >
              <div className="opt-k">{'ABCD'[i]}</div>
              {opt}
            </div>
          ))}
        </div>
        <div className={`qz-exp${revealed ? ' show' : ''}`}>{q.exp}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setMode('home')}>Exit Quiz</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {!revealed && selected !== null && (
              <button className="btn btn-ghost btn-sm" onClick={checkAnswer}>Check Answer</button>
            )}
            {revealed && (
              <button className="btn btn-primary btn-sm" onClick={nextQuestion}>
                {current + 1 >= QUIZ_BANK.length ? 'Finish' : 'Next →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
