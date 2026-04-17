import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastMsg } = useApp();
  if (!toastMsg) return null;

  const icon = toastMsg.type === 'error' ? '⚠️' : '✅';
  return (
    <div className={`toast ${toastMsg.type}`}>
      <span>{icon}</span>
      <span>{toastMsg.msg}</span>
    </div>
  );
}
