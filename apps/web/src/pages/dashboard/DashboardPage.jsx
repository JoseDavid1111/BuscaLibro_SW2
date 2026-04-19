import { useEffect, useState } from 'react';
import { reportsService } from '../../services/reports.service';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      try {
        const response = await reportsService.getStatistics();
        if (!ignore) {
          setStats(response);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'No fue posible cargar el dashboard');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Resumen del sistema</h1>
        </div>
        <div className="empty-panel">
          <p className="panel-copy">Cargando informacion...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Resumen del sistema</h1>
        </div>
        <div className="empty-panel">
          <h2 className="panel-title">No fue posible cargar el dashboard</h2>
          <p className="panel-copy">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Resumen del sistema</h1>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Libros registrados</p>
          <strong className="stat-value">{stats?.summary?.totalBooks ?? 0}</strong>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pedidos activos</p>
          <strong className="stat-value">{stats?.summary?.activeOrders ?? 0}</strong>
        </article>
        <article className="stat-card">
          <p className="stat-label">Ingresos estimados</p>
          <strong className="stat-value">
            {(stats?.summary?.totalRevenue ?? 0).toLocaleString('es-CO')}
          </strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Libros mas solicitados</h2>
            <p className="panel-copy">Consulta rapida de la demanda actual.</p>
          </div>
          <div className="list-table">
            {(stats?.mostRequestedBooks ?? []).slice(0, 5).map((item) => (
              <div key={item.bookId} className="list-row">
                <div>
                  <p className="row-title">{item.title}</p>
                  <p className="row-subtitle">Libro ID {item.bookId}</p>
                </div>
                <strong className="row-value">{item.quantity}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Frecuencia por categoria</h2>
            <p className="panel-copy">Categorias con mayor movimiento.</p>
          </div>
          <div className="list-table">
            {(stats?.ordersByCategory ?? []).slice(0, 5).map((item) => (
              <div key={item.category} className="list-row">
                <div>
                  <p className="row-title">{item.category}</p>
                  <p className="row-subtitle">Cantidad acumulada</p>
                </div>
                <strong className="row-value">{item.quantity}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Libros mas caros</h2>
        </div>
        <div className="list-table">
          {(stats?.mostExpensiveBooks ?? []).slice(0, 5).map((item) => (
            <div key={item.id} className="list-row">
              <div>
                <p className="row-title">{item.title}</p>
                <p className="row-subtitle">Libro ID {item.id}</p>
              </div>
              <strong className="row-value">
                ${Number(item.price).toLocaleString('es-CO')}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
