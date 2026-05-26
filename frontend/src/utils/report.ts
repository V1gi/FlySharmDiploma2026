import * as XLSX from 'xlsx';

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  deliveryDate: string;
  deliveryAddress: string;
  client?: { fullName: string };
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  in_production: 'В производстве',
  ready: 'Готов',
  delivering: 'Доставляется',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export function generateOrdersReport(orders: Order[]) {
  const data = [
    ['Отчёт по заказам FlyШарм'],
    [`Сформирован: ${new Date().toLocaleDateString('ru-RU')}`],
    [],
    ['№ заказа', 'Клиент', 'Адрес доставки', 'Дата доставки', 'Сумма (₽)', 'Статус'],
    ...orders.map(o => [
      `#${o.id}`,
      o.client?.fullName || '—',
      o.deliveryAddress,
      new Date(o.deliveryDate).toLocaleDateString('ru-RU'),
      Number(o.totalAmount),
      STATUS_LABELS[o.status] || o.status,
    ]),
    [],
    ['Итого заказов:', orders.length],
    ['Общая сумма:', orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)],
    ['Доставлено:', orders.filter(o => o.status === 'delivered').length],
    ['Отменено:', orders.filter(o => o.status === 'cancelled').length],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Ширина столбцов
  ws['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 35 },
    { wch: 15 },
    { wch: 12 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Заказы');
  XLSX.writeFile(wb, `Отчёт_FlyШарм_${new Date().toLocaleDateString('ru-RU')}.xlsx`);
}