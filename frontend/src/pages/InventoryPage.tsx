import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useIsMobile } from '../hooks/useIsMobile';

interface Product {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  retailPrice: number;
  currentQuantity: number;
}

export default function InventoryPage() {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [receiptForm, setReceiptForm] = useState({ productId: '', quantity: '' });
  const [productForm, setProductForm] = useState({
    name: '', category: '', color: '',
    purchasePrice: '', retailPrice: '', currentQuantity: '0',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = () => {
    client.get('/inventory')
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const handleReceipt = async () => {
    if (!receiptForm.productId || !receiptForm.quantity) {
      setError('Заполните все поля');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await client.post('/inventory/receipt', {
        productId: Number(receiptForm.productId),
        quantity: Number(receiptForm.quantity),
      });
      setShowReceiptModal(false);
      setReceiptForm({ productId: '', quantity: '' });
      loadProducts();
      setToast({ message: 'Поступление зафиксировано', type: 'success' });
    } catch {
      setError('Ошибка при добавлении поступления');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.purchasePrice || !productForm.retailPrice) {
      setError('Заполните название и цены');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await client.post('/inventory/product', {
        name: productForm.name,
        category: productForm.category,
        color: productForm.color,
        purchasePrice: Number(productForm.purchasePrice),
        retailPrice: Number(productForm.retailPrice),
        currentQuantity: Number(productForm.currentQuantity),
      });
      setShowProductModal(false);
      setProductForm({ name: '', category: '', color: '', purchasePrice: '', retailPrice: '', currentQuantity: '0' });
      loadProducts();
      setToast({ message: 'Товар добавлен на склад', type: 'success' });
    } catch {
      setError('Ошибка при создании товара');
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
          <h2 style={styles.title}>Склад</h2>
          <span style={styles.count}>{products.length} позиций</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={styles.secondaryBtn} onClick={() => { setError(''); setShowReceiptModal(true); }}>
            + Поступление
          </button>
          <button style={styles.addBtn} onClick={() => { setError(''); setShowProductModal(true); }}>
            + Новый товар
          </button>
        </div>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span style={{ flex: 3 }}>Наименование</span>
          <span style={{ flex: 1.5 }}>Категория</span>
          <span style={{ flex: 1 }}>Закуп.</span>
          <span style={{ flex: 1 }}>Розница</span>
          <span style={{ flex: 1 }}>Остаток</span>
        </div>
        {products.map(p => (
          <div key={p.id} style={styles.tableRow}>
            <span style={{ flex: 3, fontWeight: 500 }}>{p.name}</span>
            <span style={{ flex: 1.5, color: '#888', fontSize: 13 }}>{p.category || '—'}</span>
            <span style={{ flex: 1 }}>{Number(p.purchasePrice).toLocaleString()} ₽</span>
            <span style={{ flex: 1 }}>{Number(p.retailPrice).toLocaleString()} ₽</span>
            <span style={{ flex: 1, fontWeight: 600, color: p.currentQuantity < 10 ? '#e53935' : '#388e3c' }}>
              {p.currentQuantity}
            </span>
          </div>
        ))}
      </div>

      {showReceiptModal && (
        <Modal title="Поступление товара" onClose={() => setShowReceiptModal(false)}>
          <div style={styles.form}>
            <label style={styles.label}>Товар *</label>
            <select style={styles.input} value={receiptForm.productId}
              onChange={e => setReceiptForm({ ...receiptForm, productId: e.target.value })}>
              <option value="">Выберите товар</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (остаток: {p.currentQuantity})</option>
              ))}
            </select>
            <label style={styles.label}>Количество *</label>
            <input style={styles.input} type="number" placeholder="0"
              value={receiptForm.quantity}
              onChange={e => setReceiptForm({ ...receiptForm, quantity: e.target.value })} />
            {error && <p style={styles.error}>{error}</p>}
            <button style={saving ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
              onClick={handleReceipt} disabled={saving}>
              {saving ? 'Сохранение...' : 'Зафиксировать поступление'}
            </button>
          </div>
        </Modal>
      )}

      {showProductModal && (
        <Modal title="Новый товар" onClose={() => setShowProductModal(false)}>
          <div style={styles.form}>
            <label style={styles.label}>Название *</label>
            <input style={styles.input} placeholder="Шар латексный 30 см красный"
              value={productForm.name}
              onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
            <label style={styles.label}>Категория</label>
            <input style={styles.input} placeholder="Латексные шары"
              value={productForm.category}
              onChange={e => setProductForm({ ...productForm, category: e.target.value })} />
            <label style={styles.label}>Цвет</label>
            <input style={styles.input} placeholder="красный"
              value={productForm.color}
              onChange={e => setProductForm({ ...productForm, color: e.target.value })} />
            <label style={styles.label}>Закупочная цена (₽) *</label>
            <input style={styles.input} type="number" placeholder="0"
              value={productForm.purchasePrice}
              onChange={e => setProductForm({ ...productForm, purchasePrice: e.target.value })} />
            <label style={styles.label}>Розничная цена (₽) *</label>
            <input style={styles.input} type="number" placeholder="0"
              value={productForm.retailPrice}
              onChange={e => setProductForm({ ...productForm, retailPrice: e.target.value })} />
            <label style={styles.label}>Начальный остаток</label>
            <input style={styles.input} type="number" placeholder="0"
              value={productForm.currentQuantity}
              onChange={e => setProductForm({ ...productForm, currentQuantity: e.target.value })} />
            {error && <p style={styles.error}>{error}</p>}
            <button style={saving ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
              onClick={handleCreateProduct} disabled={saving}>
              {saving ? 'Сохранение...' : 'Добавить товар'}
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
  secondaryBtn: { padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#fff', color: '#111', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  loading: { padding: 40, color: '#888' },
  table: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #eee' },
  tableHeader: { display: 'flex', padding: '12px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #eee', fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase' },
  tableRow: { display: 'flex', padding: '14px 20px', borderBottom: '1px solid #f5f5f5', fontSize: 14, color: '#111', alignItems: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, color: '#555', fontWeight: 500, marginTop: 4 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, outline: 'none' },
  submitBtn: { marginTop: 8, padding: '12px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#e53935', fontSize: 13, margin: 0 },
};