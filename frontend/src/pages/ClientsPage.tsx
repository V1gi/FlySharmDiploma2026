import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { useIsMobile } from '../hooks/useIsMobile';

interface Client {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

export default function ClientsPage() {
  const isMobile = useIsMobile();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadClients = () => {
    client.get('/clients')
      .then(res => setClients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClients(); }, []);

  const handleCreate = async () => {
    if (!form.fullName || !form.phone) {
      setError('Заполните имя и телефон');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await client.post('/clients', form);
      setShowModal(false);
      setForm({ fullName: '', phone: '', email: '', address: '' });
      loadClients();
    } catch {
      setError('Ошибка при создании клиента');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  return (
    <div style={{ padding: isMobile ? '16px' : '32px 40px', paddingBottom: isMobile ? 80 : 32 }}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={styles.title}>Клиенты</h2>
          <span style={styles.count}>{clients.length} клиентов</span>
        </div>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>
          + Новый клиент
        </button>
      </div>

      <div style={styles.grid}>
        {clients.map(c => (
          <div key={c.id} style={styles.card}>
            <div style={styles.avatar}>{c.fullName.charAt(0)}</div>
            <div style={styles.info}>
              <p style={styles.name}>{c.fullName}</p>
              <p style={styles.detail}>{c.phone}</p>
              {c.email && <p style={styles.detail}>{c.email}</p>}
              {c.address && <p style={styles.detail}>{c.address}</p>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Новый клиент" onClose={() => setShowModal(false)}>
          <div style={styles.form}>
            <label style={styles.label}>Полное имя *</label>
            <input
              style={styles.input}
              placeholder="Иванова Анна Петровна"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
            />

            <label style={styles.label}>Телефон *</label>
            <input
              style={styles.input}
              placeholder="+7 (999) 000-00-00"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />

            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              placeholder="email@mail.ru"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <label style={styles.label}>Адрес</label>
            <input
              style={styles.input}
              placeholder="г. Москва, ул. ..."
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={saving ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Создать клиента'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '32px 40px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#111' },
  count: { fontSize: 14, color: '#888', backgroundColor: '#f0f0f0', padding: '3px 10px', borderRadius: 20 },
  addBtn: {
    padding: '10px 20px', borderRadius: 8, border: 'none',
    backgroundColor: '#111', color: '#fff', fontSize: 14,
    fontWeight: 600, cursor: 'pointer',
  },
  loading: { padding: 40, color: '#888' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    border: '1px solid #eee', display: 'flex', gap: 16, alignItems: 'flex-start',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#111', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 600, flexShrink: 0,
  },
  info: { flex: 1 },
  name: { margin: '0 0 4px 0', fontSize: 15, fontWeight: 600, color: '#111' },
  detail: { margin: '2px 0', fontSize: 13, color: '#888' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, color: '#555', fontWeight: 500 },
  input: {
    padding: '10px 14px', borderRadius: 8,
    border: '1px solid #e0e0e0', fontSize: 14, outline: 'none',
  },
  submitBtn: {
    marginTop: 8, padding: '12px', borderRadius: 8,
    border: 'none', backgroundColor: '#111', color: '#fff',
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  error: { color: '#e53935', fontSize: 13, margin: 0 },
};