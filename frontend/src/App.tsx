import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import OrdersPage from './pages/OrdersPage';
import ClientsPage from './pages/ClientsPage';
import InventoryPage from './pages/InventoryPage';
import DeliveriesPage from './pages/DeliveriesPage';
import EmployeesPage from './pages/EmployeesPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [page, setPage] = useState('orders');

  const handleLogin = (token: string, role: string, name: string) => {
    setToken(token);
    setRole(role);
    setName(name);
    localStorage.setItem('role', role);
    localStorage.setItem('name', name);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setToken('');
    setRole('');
    setName('');
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    // Курьер видит только доставки
    if (role === 'courier') {
      return <DeliveriesPage role={role} />;
    }
    // Сборщик видит заказы и склад
    if (role === 'assembler') {
      switch (page) {
        case 'orders': return <OrdersPage role={role} />;
        case 'inventory': return <InventoryPage />;
        default: return <OrdersPage role={role} />;
      }
    }
    // Менеджер и админ видят всё
    switch (page) {
      case 'orders': return <OrdersPage role={role} />;
      case 'clients': return <ClientsPage />;
      case 'inventory': return <InventoryPage />;
      case 'deliveries': return <DeliveriesPage role={role} />;
      case 'employees': return <EmployeesPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <OrdersPage role={role} />;
    }
  };

  return (
    <Layout
      activePage={page}
      onNavigate={setPage}
      userName={name}
      onLogout={handleLogout}
      role={role}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;