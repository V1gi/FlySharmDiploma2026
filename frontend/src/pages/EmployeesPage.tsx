import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useIsMobile } from '../hooks/useIsMobile';

interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  assembler: 'Сборщик',
  courier: 'Курьер',
};

export default function EmployeesPage() {
  const isMobile = useIsMobile();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', role: 'courier',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadEmployees = () => {
    client.get('/employees')
      .then(res => setEmployees(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEmployees(); }, []);

  const handleCreate = async () => {
    if (!form.fullName || !form.email || !form.password) {
      setError('Заполните имя, email и пароль');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await client.post('/employees', form);
      setShowModal(false);
      setForm({ fullName: '', email: '', phone: '', password: '', role: 'courier' });
      loadEmployees();
      setToast({ message: 'Сотрудник добавлен', type: 'success' });
    } catch {
      setError('Ошибка при создании сотрудника');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  return (
    <div style={{ padding: isMobile ? '16px' : '32px 40px', paddingBottom: isMobile ? 80 : 32 }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={styles.title}>Сотрудники</h2>
          <span style={styles.count}>{employees.length} сотрудников</span>
        </div>
        <button style={styles.addBtn} onClick={() => { setError(''); setShowModal(true); }}>
          + Новый сотрудник
        </button>
      </div>

      <div style={styles.grid}>
        {employees.map(e => (
          <div key={e.id} style={styles.card}>
            <div style={styles.avatar}>{e.fullName.charAt(0)}</div>
            <div style={styles.info}>
              <p style={styles.name}>{e.fullName}</p>
              <span style={styles.role}>{ROLE_LABELS[e.role] || e.role}</span>
              <p style={styles.detail}>{e.email}</p>
              {e.phone && <p style={styles.detail}>{e.phone}</p>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Новый сотрудник" onClose={() => setShowModal(false)}>
          <div style={styles.form}>
            <label style={styles.label}>Полное имя *</label>
            <input style={styles.input} placeholder="Иванов Иван Иванович"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })} />

            <label style={styles.label}>Email *</label>
            <input style={styles.input} placeholder="email@flysharm.ru"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />

            <label style={styles.label}>Телефон</label>
            <input style={styles.input} placeholder="+7 (999) 000-00-00"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />

            <label style={styles.label}>Пароль *</label>
            <input style={styles.input} type="password" placeholder="Минимум 6 символов"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />

            <label style={styles.label}>Роль *</label>
            <select style={styles.input} value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="courier">Курьер</option>
              <option value="assembler">Сборщик</option>
              <option value="manager">Менеджер</option>
              <option value="admin">Администратор</option>
            </select>

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={saving ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
              onClick={handleCreate} disabled={saving}>
              {saving ? 'Сохранение...' : 'Добавить сотрудника'}
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
  addBtn: { padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  loading: { padding: 40, color: '#888' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, border: '1px solid #eee', display: 'flex', gap: 16, alignItems: 'flex-start' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, flexShrink: 0 },
  info: { flex: 1 },
  name: { margin: '0 0 4px 0', fontSize: 15, fontWeight: 600, color: '#111' },
  role: { fontSize: 12, color: '#fff', backgroundColor: '#555', padding: '2px 8px', borderRadius: 10 },
  detail: { margin: '4px 0 0 0', fontSize: 13, color: '#888' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, color: '#555', fontWeight: 500, marginTop: 4 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, outline: 'none' },
  submitBtn: { marginTop: 8, padding: '12px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#e53935', fontSize: 13, margin: 0 },
};