import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import './App.css';

function SoonPage({ title }) {
  return (
    <section className="page-shell">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/books"
          element={<SoonPage title="Libros" />}
        />
        <Route path="/orders" element={<SoonPage title="Pedidos" />} />
        <Route path="/reports" element={<SoonPage title="Reportes" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
