import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { useIsMobile } from '../hooks/useIsMobile';

interface Delivery {
  id: number;
  deliveryStatus: string;
  courierComment: string;
  order?: { deliveryAddress: string; deliveryDate: string };
  courier?: { fullName: string };
}

interface Order {
  id: number;
  deliveryAddress: string;
}

interface Employee {
  id: number;
  fullName: string;
  role: string;
}

const STATUS_LABELS: Record<string, string> = {
  assigned: 'Назначена',
  in_progress: 'В пути',
  delivered: 'Доставлена',
  failed: 'Не доставлена',
};

const STATUS_COLORS: Record<string, string> = {
  assigned: '#1976d2',
  in_progress: '#f57c00',
  delivered: '#388e3c',
  failed: '#d32f2f',
};

interface Props { role: string; }

export default function DeliveriesPage({ role }: Props) {
  const isMobile = useIsMobile();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ orderId: '', courierId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadDeliveries = () => {
    client.get('/deliveries')
      .then(res => setDeliveries(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeliveries();
    client.get('/orders').then(res => setOrders(res.data));
    client.get('/clients').then(res => {
      // загружаем сотрудников через отдельный запрос
    });
  }, []);

  const openModal = async () => {
    try {
      const res = await client.get('/employees');
      setEmployees(res.data.filter((e: Employee) => e.role === 'courier'));
    } catch {
      setEmployees([]);
    }
    setShowModal(true);
  };

  const handleAssign = async () => {
    if (!form.orderId || !form.courierId) {
      setError('Выберите заказ и курьера');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await client.post('/deliveries/assign', {
        orderId: Number(form.orderId),
        courierId: Number(form.courierId),
      });
      setShowModal(false);
      setForm({ orderId: '', courierId: '' });
      loadDeliveries();
    } catch {
      setError('Ошибка при назначении доставки');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  return (
    <div style={{ padding: isMobile ? '16px' : '32px 40px', paddingBottom: isMobile ? 80 : 32 }}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={styles.title}>Доставки</h2>
          <span style={styles.count}>{deliveries.length} доставок</span>
        </div>
        {(role === 'admin' || role === 'manager') && (
        <button style={styles.addBtn} onClick={openModal}>+ Назначить доставку</button>
        )}
      </div>

      {deliveries.length === 0 ? (
        <div style={styles.empty}>Доставок пока нет</div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 0.5 }}>№</span>
            <span style={{ flex: 2 }}>Адрес</span>
            <span style={{ flex: 1.5 }}>Курьер</span>
            <span style={{ flex: 1 }}>Дата</span>
            <span style={{ flex: 1 }}>Статус</span>
          </div>
          {deliveries.map(d => (
            <div key={d.id} style={styles.tableRow}>
              <span style={{ flex: 0.5, color: '#888' }}>#{d.id}</span>
              <span style={{ flex: 2 }}>{d.order?.deliveryAddress || '—'}</span>
              <span style={{ flex: 1.5, color: '#555' }}>{d.courier?.fullName || '—'}</span>
              <span style={{ flex: 1, color: '#555' }}>
                {d.order?.deliveryDate ? new Date(d.order.deliveryDate).toLocaleDateString('ru-RU') : '—'}
              </span>
              <span style={{
                flex: 1, fontWeight: 500, fontSize: 13,
                color: STATUS_COLORS[d.deliveryStatus] || '#555',
              }}>
                {STATUS_LABELS[d.deliveryStatus] || d.deliveryStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Назначить доставку" onClose={() => setShowModal(false)}>
          <div style={styles.form}>
            <label style={styles.label}>Заказ *</label>
            <select
              style={styles.input}
              value={form.orderId}
              onChange={e => setForm({ ...form, orderId: e.target.value })}
            >
              <option value="">Выберите заказ</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>#{o.id} — {o.deliveryAddress}</option>
              ))}
            </select>

            <label style={styles.label}>Курьер *</label>
            <select
              style={styles.input}
              value={form.courierId}
              onChange={e => setForm({ ...form, courierId: e.target.value })}
            >
              <option value="">Выберите курьера</option>
              {employees.length === 0 && <option disabled>Нет доступных курьеров</option>}
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullName}</option>
              ))}
            </select>

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={saving ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
              onClick={handleAssign}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Назначить'}
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
  empty: { padding: 40, color: '#aaa', textAlign: 'center' },
  table: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #eee' },
  tableHeader: {
    display: 'flex', padding: '12px 20px',
    backgroundColor: '#fafafa', borderBottom: '1px solid #eee',
    fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase',
  },
  tableRow: {
    display: 'flex', padding: '14px 20px',
    borderBottom: '1px solid #f5f5f5', fontSize: 14, color: '#111', alignItems: 'center',
  },
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