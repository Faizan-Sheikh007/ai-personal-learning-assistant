import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

const FILE_ICONS = { pdf: '📄', video: '🎬', image: '🖼', link: '🔗', text: '📝', default: '📁' };

function getFileType(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  if (['txt', 'md', 'doc', 'docx'].includes(ext)) return 'text';
  return 'default';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function Upload() {
  const { uploadedFiles, addFile, removeFile, showToast } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const fileRef = useRef(null);

  const processFiles = (files) => {
    Array.from(files).forEach(f => {
      const previewUrl = URL.createObjectURL(f);   // blob URL for local preview
      addFile({
        id: Date.now() + Math.random(),
        name: f.name,
        size: formatSize(f.size),
        type: getFileType(f),
        date: new Date().toLocaleDateString(),
        previewUrl,    // ← used by CourseDetail / inline preview
        fileObject: f  // ← keep the real File for backend upload
      });
    });
    showToast(`${files.length} file(s) uploaded!`);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const addLink = () => {
    if (!linkInput.trim()) return;
    addFile({ id: Date.now(), name: linkInput.trim(), size: 'URL', type: 'link', date: new Date().toLocaleDateString() });
    setLinkInput('');
    showToast('Link added!');
  };

  const stats = {
    total: uploadedFiles.length,
    videos: uploadedFiles.filter(f => f.type === 'video').length,
    pdfs: uploadedFiles.filter(f => f.type === 'pdf').length,
    links: uploadedFiles.filter(f => f.type === 'link').length,
    images: uploadedFiles.filter(f => f.type === 'image').length,
  };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>Upload Content</h2>
        <p style={{ fontSize: '.83rem', color: 'var(--text3)', marginTop: 3 }}>Add learning materials — videos, PDFs, notes, quizzes, and more</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22 }}>
        <div>
          <div
            className={`upload-zone${dragOver ? ' drag-over' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => processFiles(e.target.files)} />
            <div className="uz-icon">📁</div>
            <div className="uz-title">Drop files here or click to browse</div>
            <div className="uz-sub">Supports videos, PDFs, images, text files, links</div>
            <div className="uz-types">
              <span className="pill pill-red">📄 PDF</span>
              <span className="pill pill-purple">🎬 Video</span>
              <span className="pill pill-teal">🔗 Link</span>
              <span className="pill pill-gray">📝 Notes</span>
              <span className="pill pill-gold">🖼 Image</span>
            </div>
          </div>

          <div className="card mt-16">
            <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 14 }}>Quick Add — URL / Link</h5>
            <div style={{ display: 'flex', gap: 9 }}>
              <input
                type="text"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLink()}
                placeholder="Paste YouTube URL, article link, or any web resource…"
                style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '.83rem', outline: 'none' }}
              />
              <button className="btn btn-primary btn-sm" onClick={addLink}>+ Add</button>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="sec-hd">
              <h3>Uploaded Content</h3>
              <span className="link" onClick={() => { /* clearAll */ }}>Clear All</span>
            </div>
            {uploadedFiles.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">📂</div>
                <div className="es-title">No files yet</div>
                <div className="es-sub">Upload files or add links above to get started.</div>
              </div>
            ) : uploadedFiles.map(f => (
              <div key={f.id} className="file-item">
                <div className="fi-icon" style={{ background: 'var(--surface2)' }}>{FILE_ICONS[f.type] || FILE_ICONS.default}</div>
                <div className="fi-info">
                  <div className="fn">{f.name}</div>
                  <div className="fs">{f.size} · {f.date}</div>
                </div>
                <span className={`pill pill-${f.type === 'pdf' ? 'red' : f.type === 'video' ? 'purple' : f.type === 'link' ? 'teal' : 'gray'}`} style={{ fontSize: '.62rem' }}>{f.type}</span>
                {f.previewUrl && (
                  <a href={f.previewUrl} target="_blank" rel="noreferrer"
                    style={{ fontSize: '.7rem', padding: '3px 9px', background: 'var(--surface2)', color: 'var(--text2)', borderRadius: 7, textDecoration: 'none', border: '1px solid var(--border2)' }}
                    title="Preview file">👁 Preview</a>
                )}
                <button className="btn btn-danger btn-xs" onClick={() => removeFile(f.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>🤖 AI Processing</h5>
            <p style={{ fontSize: '.78rem', color: 'var(--text2)', lineHeight: 1.65, marginBottom: 12 }}>Upload any file and our AI will automatically extract key concepts, generate quiz questions, and add content to your learning path.</p>
            {['Auto-extract key concepts', 'Generate quiz questions', 'Add to learning path', 'Summarize content'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: '.78rem', marginBottom: 9 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(0,217,166,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', color: 'var(--accent)' }}>✓</div>
                {item}
              </div>
            ))}
          </div>

          <div className="card">
            <h5 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 12 }}>Upload Stats</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Total Files', stats.total], ['Videos', stats.videos], ['PDFs', stats.pdfs], ['Links', stats.links], ['Images', stats.images]].map(([lbl, val]) => (
                <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.8rem' }}>
                  <span style={{ color: 'var(--text2)' }}>{lbl}</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
