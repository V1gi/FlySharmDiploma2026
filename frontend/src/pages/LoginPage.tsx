import React, { useState } from 'react';
import client from '../api/client';

interface Props {
  onLogin: (token: string, role: string, name: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.token, res.data.role, res.data.name);
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>FlyШарм</h1>
        <p style={styles.subtitle}>CRM-система</p>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: '32px 24px',
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 8px 0',
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    fontSize: 15,
    outline: 'none',
    backgroundColor: '#fafafa',
  },
  button: {
    marginTop: 8,
    padding: '13px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#111',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    color: '#e53935',
    fontSize: 13,
    margin: 0,
    textAlign: 'center',
  },
};