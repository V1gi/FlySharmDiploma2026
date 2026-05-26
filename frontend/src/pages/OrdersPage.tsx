import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useIsMobile } from '../hooks/useIsMobile';

interface Order {
  id: number;
  deliveryAddress: string;
  deliveryDate: string;
  totalAmount: number;
  status: string;
  client?: { fullName: string };
}

interface Client { id: number; fullName: string; }
interface Product { id: number; name: string; currentQuantity: number; retailPrice: number; }
interface OrderItem { productId: number; quantity: number; }
interface Props { role: string; }

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  in_production: 'В производстве',
  ready: 'Готов',
  delivering: 'Доставляется',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#1976d2',
  in_production: '#f57c00',
  ready: '#388e3c',
  delivering: '#7b1fa2',
  delivered: '#388e3c',
  cancelled: '#d32f2f',
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS);

export default function OrdersPage({ role }: Props) {
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({
    clientId: '', deliveryAddress: '', deliveryDate: '', totalAmount: '',
  });
  const [items, setItems] = useState<OrderItem[]>([{ productId: 0, quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = () => {
    client.get('/orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    client.get('/clients').then(res => setClients(res.data));
    client.get('/inventory').then(res => setProducts(res.data));
  }, []);

  const addItem = () => setItems([...items, { productId: 0, quantity: 1 }]);

  const updateItem = (index: number, field: keyof OrderItem, value: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
    const total = updated.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? Number(product.retailPrice) * item.quantity : 0);
    }, 0);
    setForm(f => ({ ...f, totalAmount: total.toString() }));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!form.clientId || !form.deliveryAddress || !form.deliveryDate) {
      setError('Заполните все обязательные поля');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await client.post('/orders', {
        clientId: Number(form.clientId),
        deliveryAddress: form.deliveryAddress,
        deliveryDate: form.deliveryDate,
        totalAmount: Number(form.totalAmount) || 0,
        items: items.filter(i => i.productId > 0),
      });
      setShowModal(false);
      setForm({ clientId: '', deliveryAddress: '', deliveryDate: '', totalAmount: '' });
      setItems([{ productId: 0, quantity: 1 }]);
      loadOrders();
      client.get('/inventory').then(res => setProducts(res.data));
      setToast({ message: 'Заказ успешно создан', type: 'success' });
    } catch {
      setError('Ошибка при создании заказа');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await client.patch(`/orders/${orderId}/status`, { status });
      loadOrders();
      setToast({ message: 'Статус обновлён', type: 'success' });
    } catch {
      setToast({ message: 'Ошибка при обновлении статуса', type: 'error' });
    }
  };

  const handleDelete = async (orderId: number) => {
    if (!window.confirm('Удалить заказ?')) return;
    try {
      await client.delete(`/orders/${orderId}`);
      loadOrders();
      setToast({ message: 'Заказ удалён', type: 'success' });
    } catch {
      setToast({ message: 'Ошибка при удалении', type: 'error' });
    }
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  const containerStyle: React.CSSProperties = {
    padding: isMobile ? '16px' : '32px 40px',
    paddingBottom: isMobile ? 80 : 32,
  };

  const mobileCardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    border: '1px solid #eee',
  };

  return (
    <div style={containerStyle}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={styles.title}>Заказы</h2>
          <span style={styles.count}>{orders.length} заказов</span>
        </div>
        {(role === 'admin' || role === 'manager') && (
          <button style={styles.addBtn} onClick={() => setShowModal(true)}>
            {isMobile ? '+' : '+ Новый заказ'}
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div style={styles.empty}>Заказов пока нет</div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => (
            <div key={order.id} style={mobileCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: 12, color: '#888' }}>#{order.id}</span>
                  <p style={{ margin: '4px 0', fontSize: 15, fontWeight: 600, color: '#111' }}>
                    {order.client?.fullName || '—'}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: 13, color: '#555' }}>{order.deliveryAddress}</p>
                  <p style={{ margin: '2px 0', fontSize: 13, color: '#888' }}>
                    {new Date(order.deliveryDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 600 }}>
                    {Number(order.totalAmount).toLocaleString()} ₽
                  </p>
                  {(role === 'admin' || role === 'manager') && (
                    <button style={styles.deleteBtn} onClick={() => handleDelete(order.id)}>✕</button>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <select
                  style={{ ...styles.statusSelect, width: '100%' }}
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 0.5 }}>№</span>
            <span style={{ flex: 2 }}>Клиент</span>
            <span style={{ flex: 2 }}>Адрес</span>
            <span style={{ flex: 1 }}>Дата</span>
            <span style={{ flex: 1 }}>Сумма</span>
            <span style={{ flex: 1.5 }}>Статус</span>
            <span style={{ flex: 0.5 }}></span>
          </div>
          {orders.map(order => (
            <div key={order.id} style={styles.tableRow}>
              <span style={{ flex: 0.5, color: '#888' }}>#{order.id}</span>
              <span style={{ flex: 2 }}>{order.client?.fullName || '—'}</span>
              <span style={{ flex: 2, color: '#555' }}>{order.deliveryAddress}</span>
              <span style={{ flex: 1, color: '#555' }}>
                {new Date(order.deliveryDate).toLocaleDateString('ru-RU')}
              </span>
              <span style={{ flex: 1 }}>{Number(order.totalAmount).toLocaleString()} ₽</span>
              <span style={{ flex: 1.5 }}>
                <select
                  style={{ ...styles.statusSelect, color: STATUS_COLORS[order.status] || '#555' }}
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </span>
              <span style={{ flex: 0.5 }}>
                {(role === 'admin' || role === 'manager') && (
                  <button style={styles.deleteBtn} onClick={() => handleDelete(order.id)}>✕</button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Новый заказ" onClose={() => setShowModal(false)}>
          <div style={styles.form}>
            <label style={styles.label}>Клиент *</label>
            <select style={styles.input} value={form.clientId}
              onChange={e => setForm({ ...form, clientId: e.target.value })}>
              <option value="">Выберите клиента</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>

            <label style={styles.label}>Адрес доставки *</label>
            <input style={styles.input} placeholder="г. Москва, ул. ..."
              value={form.deliveryAddress}
              onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} />

            <label style={styles.label}>Дата доставки *</label>
            <input style={styles.input} type="date" value={form.deliveryDate}
              onChange={e => setForm({ ...form, deliveryDate: e.target.value })} />

            <label style={styles.label}>Товары</label>
            {items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <select
                  style={{ ...styles.input, flex: 2, minWidth: 0 }}
                  value={item.productId}
                  onChange={e => updateItem(index, 'productId', Number(e.target.value))}
                >
                  <option value={0}>Выберите товар</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ост: {p.currentQuantity})
                    </option>
                  ))}
                </select>
                <input
                  style={{ ...styles.input, width: 60, flexShrink: 0 }}
                  type="number" min={1}
                  value={item.quantity}
                  onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                />
                {items.length > 1 && (
                  <button style={styles.deleteBtn} onClick={() => removeItem(index)}>✕</button>
                )}
              </div>
            ))}
            <button style={styles.addItemBtn} onClick={addItem}>+ Добавить товар</button>

            <label style={styles.label}>Итоговая сумма (₽)</label>
            <input style={{ ...styles.input, backgroundColor: '#f9f9f9' }}
              type="number" value={form.totalAmount} readOnly />

            {error && <p style={styles.error}>{error}</p>}
            <button
              style={saving ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
              onClick={handleCreate} disabled={saving}>
              {saving ? 'Сохранение...' : 'Создать заказ'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#111' },
  count: {
    fontSize: 14, color: '#888',
    backgroundColor: '#f0f0f0', padding: '3px 10px', borderRadius: 20,
  },
  addBtn: {
    padding: '10px 20px', borderRadius: 8, border: 'none',
    backgroundColor: '#111', color: '#fff', fontSize: 14,
    fontWeight: 600, cursor: 'pointer',
  },
  loading: { padding: 40, color: '#888' },
  empty: { padding: 40, color: '#aaa', textAlign: 'center' },
  table: {
    backgroundColor: '#fff', borderRadius: 12,
    overflow: 'hidden', border: '1px solid #eee',
  },
  tableHeader: {
    display: 'flex', padding: '12px 20px',
    backgroundColor: '#fafafa', borderBottom: '1px solid #eee',
    fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase',
  },
  tableRow: {
    display: 'flex', padding: '12px 20px',
    borderBottom: '1px solid #f5f5f5',
    fontSize: 14, color: '#111', alignItems: 'center',
  },
  statusSelect: {
    border: '1px solid #eee', borderRadius: 6,
    padding: '4px 8px', fontSize: 13,
    fontWeight: 500, cursor: 'pointer',
    backgroundColor: '#fafafa', outline: 'none',
  },
  deleteBtn: {
    border: 'none', backgroundColor: 'transparent',
    color: '#ccc', cursor: 'pointer',
    fontSize: 16, padding: '4px 8px', borderRadius: 6,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, color: '#555', fontWeight: 500, marginTop: 4 },
  input: {
    padding: '10px 14px', borderRadius: 8,
    border: '1px solid #e0e0e0', fontSize: 14, outline: 'none',
  },
  submitBtn: {
    marginTop: 8, padding: '12px', borderRadius: 8,
    border: 'none', backgroundColor: '#111', color: '#fff',
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  addItemBtn: {
    padding: '8px 14px', borderRadius: 8,
    border: '1px dashed #ccc', backgroundColor: 'transparent',
    color: '#555', fontSize: 13, cursor: 'pointer',
  },
  error: { color: '#e53935', fontSize: 13, margin: 0 },
};
