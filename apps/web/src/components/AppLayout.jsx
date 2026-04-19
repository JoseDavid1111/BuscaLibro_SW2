import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', hint: 'Resumen general' },
  { to: '/books', label: 'Libros', hint: 'Catalogo e inventario' },
  { to: '/orders', label: 'Pedidos', hint: 'Seguimiento y gestion' },
  { to: '/reports', label: 'Reportes', hint: 'Estadisticas y analitica' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <p className="brand-kicker">BuscaLibro</p>
          <h1 className="brand-title">Centro de gestion</h1>
        </div>

        <nav className="side-nav" aria-label="Navegacion principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'side-link side-link-active' : 'side-link'
              }
            >
              <span className="side-link-label">{item.label}</span>
              <span className="side-link-hint">{item.hint}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <p className="sidebar-user-name">{user?.name || user?.email}</p>
          <p className="sidebar-user-role">{user?.role || 'Usuario autenticado'}</p>
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
