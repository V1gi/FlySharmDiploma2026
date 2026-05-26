import React from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 12,
    width: 480, maxHeight: '90vh',
    overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid #eee',
  },
  title: { margin: 0, fontSize: 17, fontWeight: 600, color: '#111' },
  closeBtn: {
    border: 'none', backgroundColor: 'transparent',
    fontSize: 18, cursor: 'pointer', color: '#888',
    padding: '4px 8px', borderRadius: 6,
  },
  body: { padding: 24 },
};