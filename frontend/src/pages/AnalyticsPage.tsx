import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { generateOrdersReport } from '../utils/report';
import { useIsMobile } from '../hooks/useIsMobile';

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  deliveryDate: string;
  deliveryAddress: string;
  client?: { fullName: string };
}

interface Product {
  id: number;
  name: string;
  currentQuantity: number;
}

export default function AnalyticsPage() {
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/orders'),
      client.get('/inventory'),
    ]).then(([ordersRes, inventoryRes]) => {
      setOrders(ordersRes.data);
      setProducts(inventoryRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  // Считаем статистику
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const statusCounts: Record<string, number> = {};
  orders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const lowStock = products.filter(p => p.currentQuantity < 10);

  // Выручка по месяцам (последние 6 месяцев)
  const monthlyData: Record<string, number> = {};
    orders.forEach(o => {
        const date = new Date(o.deliveryDate);
        const key = date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
        monthlyData[key] = (monthlyData[key] || 0) + Number(o.totalAmount);
    });

  const months = Object.entries(monthlyData).slice(-6);
  const maxRevenue = Math.max(...months.map(([, v]) => v), 1);

  const STATUS_LABELS: Record<string, string> = {
    new: 'Новые',
    in_production: 'В производстве',
    ready: 'Готовы',
    delivering: 'Доставляются',
    delivered: 'Доставлены',
    cancelled: 'Отменены',
  };

  const STATUS_COLORS: Record<string, string> = {
    new: '#1976d2',
    in_production: '#f57c00',
    ready: '#388e3c',
    delivering: '#7b1fa2',
    delivered: '#43a047',
    cancelled: '#e53935',
  };

  return (
    <div style={{ padding: isMobile ? '16px' : '32px 40px', paddingBottom: isMobile ? 80 : 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111' }}>Аналитика</h2>
  <button
    style={styles.reportBtn}
    onClick={() => generateOrdersReport(orders)}
  >
    Скачать отчёт Excel
  </button>
</div>

      {/* Карточки */}
      <div style={{
  display: 'grid',
  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
  gap: 16,
  marginBottom: 24,
}}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Всего заказов</p>
          <p style={styles.cardValue}>{orders.length}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Выручка (доставлено)</p>
          <p style={styles.cardValue}>{totalRevenue.toLocaleString()} ₽</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Доставлено заказов</p>
          <p style={styles.cardValue}>{statusCounts['delivered'] || 0}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Товаров с низким остатком</p>
          <p style={{ ...styles.cardValue, color: lowStock.length > 0 ? '#e53935' : '#388e3c' }}>
            {lowStock.length}
          </p>
        </div>
      </div>

      <div style={{
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  gap: 16,
  marginBottom: 24,
}}>
        {/* График выручки по месяцам */}
        <div style={styles.chartBox}>
  <h3 style={styles.chartTitle}>Выручка по месяцам</h3>
  {months.length === 0 ? (
    <p style={styles.empty}>Нет данных</p>
  ) : (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {months.map(([month, value]) => {
          const pct = Math.max(Math.round((value / maxRevenue) * 100), 2);
          return (
            <tr key={month}>
              <td style={{ fontSize: 12, color: '#888', paddingRight: 12, whiteSpace: 'nowrap', width: 60 }}>
                {month}
              </td>
              <td style={{ width: '100%', paddingTop: 6, paddingBottom: 6 }}>
                <div style={{
                  width: `${pct}%`,
                  height: 24,
                  backgroundColor: '#5677ef',
                  borderRadius: 4,
                  minWidth: 4,
                }} />
              </td>
              <td style={{ fontSize: 12, color: '#555555', paddingLeft: 12, whiteSpace: 'nowrap' }}>
                {Number(value).toLocaleString()} ₽
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )}
</div>

        {/* Статусы заказов */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Заказы по статусам</h3>
          <div style={styles.statusList}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} style={styles.statusRow}>
                <div style={styles.statusLeft}>
                  <div style={{
                    ...styles.statusDot,
                    backgroundColor: STATUS_COLORS[status] || '#999',
                  }} />
                  <span style={styles.statusName}>{STATUS_LABELS[status] || status}</span>
                </div>
                <div style={styles.statusRight}>
                  <div style={styles.statusTrack}>
                    <div style={{
                      ...styles.statusBar,
                      width: `${Math.round((count / orders.length) * 100)}%`,
                      backgroundColor: STATUS_COLORS[status] || '#999',
                    }} />
                  </div>
                  <span style={styles.statusCount}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Товары с низким остатком */}
      {lowStock.length > 0 && (
        <div style={styles.alertBox}>
          <h3 style={styles.alertTitle}>⚠️ Товары с низким остатком</h3>
          <div style={styles.alertList}>
            {lowStock.map(p => (
              <div key={p.id} style={styles.alertItem}>
                <span>{p.name}</span>
                <span style={styles.alertQty}>{p.currentQuantity} шт.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '32px 40px' },
  title: { margin: '0 0 24px 0', fontSize: 22, fontWeight: 700, color: '#111' },
  loading: { padding: 40, color: '#888' },
  empty: { color: '#aaa', textAlign: 'center', padding: 20 },

  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #eee' },
  cardLabel: { margin: '0 0 8px 0', fontSize: 13, color: '#888' },
  cardValue: { margin: 0, fontSize: 26, fontWeight: 700, color: '#111' },

  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  chartBox: { backgroundColor: '#fff', borderRadius: 12, padding: 24, border: '1px solid #eee' },
  chartTitle: { margin: '0 0 20px 0', fontSize: 15, fontWeight: 600, color: '#111' },

  reportBtn: {
  padding: '10px 20px', borderRadius: 8,
  border: 'none', backgroundColor: '#111',
  color: '#fff', fontSize: 14,
  fontWeight: 600, cursor: 'pointer',
},

  statusList: { display: 'flex', flexDirection: 'column', gap: 12 },
  statusRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  statusLeft: { display: 'flex', alignItems: 'center', gap: 8, width: 130 },
  statusDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  statusName: { fontSize: 13, color: '#555' },
  statusRight: { display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  statusTrack: { flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  statusBar: { height: '100%', borderRadius: 4 },
  statusCount: { fontSize: 13, fontWeight: 600, color: '#111', width: 24, textAlign: 'right' },

  alertBox: { backgroundColor: '#fff', borderRadius: 12, padding: 24, border: '1px solid #fce4e4' },
  alertTitle: { margin: '0 0 16px 0', fontSize: 15, fontWeight: 600, color: '#e53935' },
  alertList: { display: 'flex', flexDirection: 'column', gap: 8 },
  alertItem: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#333' },
  alertQty: { fontWeight: 600, color: '#e53935' },
};