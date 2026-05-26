import React, { useEffect } from 'react';

interface Props {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      ...styles.toast,
      backgroundColor: type === 'success' ? '#111' : '#e53935',
    }}>
      {message}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed', bottom: 32, right: 32,
    color: '#fff', padding: '14px 24px',
    borderRadius: 10, fontSize: 14, fontWeight: 500,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    zIndex: 2000, animation: 'fadeIn 0.2s ease',
  },
};