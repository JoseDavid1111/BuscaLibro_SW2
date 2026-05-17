import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/inventory', label: 'Inventario', icon: '📚' },
  { to: '/orders', label: 'Pedidos', icon: '📦' },
  { to: '/reports', label: 'Reportes', icon: '📈' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <NavLink to="/">BuscaLibro</NavLink>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-spacer" />
          <div className="header-user">
            <span className="user-name">{user?.name || user?.email}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
