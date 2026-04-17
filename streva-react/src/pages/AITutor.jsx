import React, { useState, useRef, useEffect } from 'react';
import { AI_RESPONSES } from '../data';

const INIT_MSG = { role: 'ai', text: "Hello! I'm your AI cybersecurity tutor powered by Streva's ML models. I can explain concepts, generate quizzes, and answer any security questions. What would you like to learn today? 🤖" };

const QUICK_PROMPTS = [
  { label: 'Explain OSI Model', msg: 'Explain the OSI model in simple terms' },
  { label: 'Man-in-the-Middle', msg: 'What is a man-in-the-middle attack?' },
  { label: 'AES Encryption', msg: 'How does AES encryption work?' },
  { label: 'Generate Quiz', msg: 'Create a quiz on network security for me' },
];

function getAIReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('osi')) return AI_RESPONSES.osi;
  if (lower.includes('mitm') || lower.includes('man in the') || lower.includes('man-in-the')) return AI_RESPONSES.mitm;
  if (lower.includes('aes') || lower.includes('encrypt')) return AI_RESPONSES.aes;
  if (lower.includes('quiz')) return AI_RESPONSES.quiz;
  return `Great question! Based on your learning history, for "${msg}" — this topic falls under network security. I recommend checking Section 2 of your current course first. Would you like me to generate practice questions?`;
}

export default function AITutor() {
  const [messages, setMessages] = useState([INIT_MSG]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: getAIReply(msg) }]);
    }, 800 + Math.random() * 700);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 22, height: 'calc(100vh - 140px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 16 }}>
          AI Tutor <span className="pill pill-purple" style={{ fontSize: '.65rem' }}>Beta</span>
        </div>
        <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--rl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: m.role === 'ai' ? 'linear-gradient(135deg,var(--primary),var(--accent))' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', flexShrink: 0 }}>
                  {m.role === 'ai' ? '🤖' : '👤'}
                </div>
                <div style={{ maxWidth: '80%', background: m.role === 'ai' ? 'var(--surface2)' : 'var(--primary-pale)', border: `1px solid ${m.role === 'ai' ? 'var(--border2)' : 'rgba(108,71,255,.2)'}`, borderRadius: 12, padding: '11px 14px', fontSize: '.82rem', lineHeight: 1.65, color: 'var(--text)', whiteSpace: 'pre-line' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', flexShrink: 0 }}>🤖</div>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '11px 14px', fontSize: '.82rem', color: 'var(--text2)' }}>
                  ✦ Thinking<span style={{ animation: 'blink 1s infinite' }}>...</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: 14, display: 'flex', gap: 9 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything about cybersecurity…"
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '.83rem', outline: 'none' }}
            />
            <button className="btn btn-primary" onClick={() => send()}>➤</button>
          </div>
        </div>
      </div>

      <div>
        <div className="ai-card mb-16">
          <div className="ai-hd"><div className="ai-star">✦</div><span>Quick Prompts</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} className="ai-btn" onClick={() => send(p.msg)}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="card">
          <h5 style={{ fontSize: '.83rem', fontWeight: 700, marginBottom: 12 }}>AI Model Info</h5>
          <div style={{ fontSize: '.78rem', color: 'var(--text2)', lineHeight: 1.65 }}>
            <div style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text)' }}>Backend:</strong> Python Flask + scikit-learn</div>
            <div style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text)' }}>Model:</strong> Adaptive learning + NLP</div>
            <div><strong style={{ color: 'var(--text)' }}>Accuracy:</strong> <span style={{ color: 'var(--accent)' }}>94.2%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
