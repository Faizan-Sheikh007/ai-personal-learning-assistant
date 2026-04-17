import React from 'react';
import { useApp } from '../context/AppContext';

export default function Badges() {
  const { badges } = useApp();
  const earned = badges.filter(b => b.earned).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>My Badges</h2>
          <p style={{ fontSize: '.83rem', color: 'var(--text3)', marginTop: 3 }}>{earned}/{badges.length} badges earned</p>
        </div>
      </div>

      <div className="badge-grid">
        {badges.map((b, i) => (
          <div key={i} className={`badge-c${b.earned ? ' earned' : ' locked'}`}>
            <div className="badge-iw" style={{ background: b.bg }}>
              <span style={{ fontSize: '1.6rem' }}>{b.icon}</span>
              {b.earned && <div className="badge-ck">✓</div>}
            </div>
            <div className="badge-name">{b.name}</div>
            <div className="badge-desc">{b.desc}</div>
            <div className="badge-xp">{b.earned ? '✓ Earned' : '🔒 ' + b.xp + ' XP to unlock'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
