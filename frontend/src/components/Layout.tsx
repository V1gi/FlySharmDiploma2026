import React, { useState } from 'react';
import { useWindowWidth } from '../hooks/useWindowWidth';

interface Props {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  userName: string;
  onLogout: () => void;
  role: string;
}

const NAV_BY_ROLE: Record<string, { id: string; label: string }[]> = {
  admin: [
    { id: 'orders', label: 'Заказы' },
    { id: 'clients', label: 'Клиенты' },
    { id: 'inventory', label: 'Склад' },
    { id: 'deliveries', label: 'Доставки' },
    { id: 'employees', label: 'Сотрудники' },
    { id: 'analytics', label: 'Аналитика' },
  ],
  manager: [
    { id: 'orders', label: 'Заказы' },
    { id: 'clients', label: 'Клиенты' },
    { id: 'deliveries', label: 'Доставки' },
    { id: 'analytics', label: 'Аналитика' },
  ],
  assembler: [
    { id: 'orders', label: 'Заказы' },
    { id: 'inventory', label: 'Склад' },
  ],
  courier: [
    { id: 'deliveries', label: 'Доставки' },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  assembler: 'Сборщик',
  courier: 'Курьер',
};

export default function Layout({ children, activePage, onNavigate, userName, onLogout, role }: Props) {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.manager;

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Мобильный хедер */}
        <div style={mobileStyles.header}>
          <span style={mobileStyles.logo}>FlyШарм</span>
          <button style={mobileStyles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Мобильное меню */}
        {menuOpen && (
          <div style={mobileStyles.drawer}>
            <div style={mobileStyles.drawerUser}>
              <p style={mobileStyles.drawerName}>{userName}</p>
              <p style={mobileStyles.drawerRole}>{ROLE_LABELS[role] || role}</p>
            </div>
            {navItems.map(item => (
              <button
                key={item.id}
                style={activePage === item.id
                  ? { ...mobileStyles.drawerItem, ...mobileStyles.drawerItemActive }
                  : mobileStyles.drawerItem}
                onClick={() => handleNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button style={mobileStyles.logoutBtn} onClick={onLogout}>Выйти</button>
          </div>
        )}

        {/* Контент */}
        <div style={{ paddingTop: 56 }}>
          {children}
        </div>

        {/* Нижняя навигация */}
        <div style={mobileStyles.bottomNav}>
          {navItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              style={activePage === item.id
                ? { ...mobileStyles.bottomItem, ...mobileStyles.bottomItemActive }
                : mobileStyles.bottomItem}
              onClick={() => handleNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Десктоп
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <aside style={desktopStyles.sidebar}>
        <div>
          <div style={desktopStyles.logo}>FlyШарм</div>
          <div style={desktopStyles.roleTag}>{ROLE_LABELS[role] || role}</div>
        </div>
        <nav style={desktopStyles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              style={activePage === item.id
                ? { ...desktopStyles.navItem, ...desktopStyles.navItemActive }
                : desktopStyles.navItem}
              onClick={() => handleNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div style={desktopStyles.userSection}>
          <p style={desktopStyles.userName}>{userName}</p>
          <button style={desktopStyles.logoutBtn} onClick={onLogout}>Выйти</button>
        </div>
      </aside>
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

const desktopStyles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220, backgroundColor: '#fff',
    borderRight: '1px solid #eee',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed', top: 0, left: 0, bottom: 0,
  },
  logo: { fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4, paddingLeft: 12 },
  roleTag: { fontSize: 11, color: '#888', paddingLeft: 12, marginBottom: 24 },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navItem: {
    padding: '10px 12px', borderRadius: 8, border: 'none',
    backgroundColor: 'transparent', color: '#555',
    fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
  },
  navItemActive: { backgroundColor: '#f0f0f0', color: '#111', fontWeight: 600 },
  userSection: { borderTop: '1px solid #eee', paddingTop: 16 },
  userName: { fontSize: 13, color: '#888', margin: '0 0 8px 0', paddingLeft: 12 },
  logoutBtn: {
    padding: '8px 12px', borderRadius: 8,
    border: '1px solid #e0e0e0', backgroundColor: 'transparent',
    color: '#555', fontSize: 13, cursor: 'pointer',
    width: '100%', textAlign: 'left',
  },
};

const mobileStyles: Record<string, React.CSSProperties> = {
  header: {
    position: 'fixed', top: 0, left: 0, right: 0,
    height: 56, backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px', zIndex: 100,
  },
  logo: { fontSize: 18, fontWeight: 700, color: '#111' },
  menuBtn: {
    border: 'none', backgroundColor: 'transparent',
    fontSize: 22, cursor: 'pointer', color: '#111',
    padding: '4px 8px',
  },
  drawer: {
    position: 'fixed', top: 56, left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', zIndex: 99,
    display: 'flex', flexDirection: 'column',
    padding: '16px',
    borderTop: '1px solid #eee',
  },
  drawerUser: { marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' },
  drawerName: { margin: '0 0 4px 0', fontSize: 15, fontWeight: 600, color: '#111' },
  drawerRole: { margin: 0, fontSize: 13, color: '#888' },
  drawerItem: {
    padding: '14px 16px', borderRadius: 10, border: 'none',
    backgroundColor: 'transparent', color: '#555',
    fontSize: 16, fontWeight: 500, cursor: 'pointer',
    textAlign: 'left', marginBottom: 4,
  },
  drawerItemActive: { backgroundColor: '#f0f0f0', color: '#111', fontWeight: 600 },
  logoutBtn: {
    marginTop: 'auto', padding: '14px 16px', borderRadius: 10,
    border: '1px solid #eee', backgroundColor: 'transparent',
    color: '#888', fontSize: 15, cursor: 'pointer', textAlign: 'left',
  },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTop: '1px solid #eee',
    display: 'flex', zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  bottomItem: {
    flex: 1, padding: '10px 4px', border: 'none',
    backgroundColor: 'transparent', color: '#888',
    fontSize: 11, cursor: 'pointer', textAlign: 'center',
  },
  bottomItemActive: { color: '#111', fontWeight: 600 },
};