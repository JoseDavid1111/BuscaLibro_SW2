import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import MainPage from './pages/MainPage';
import InventoryPage from './pages/inventory/InventoryPage';
import OrdersPage from './pages/orders/OrdersPage';
import ReportsPage from './pages/reports/ReportsPage';

function DashboardPage() {
  return <h1>Dashboard</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout><DashboardPage /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <DashboardLayout><InventoryPage /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <DashboardLayout><OrdersPage /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout><ReportsPage /></DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
