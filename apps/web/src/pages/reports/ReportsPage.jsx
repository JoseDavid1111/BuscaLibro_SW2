import { useState, useEffect, useCallback } from 'react';
import { reportsService } from '../../services/reports.service';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reportsService.getStatistics();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (loading) return <div className="loading">Cargando estadísticas...</div>;

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Reportes</h1>
        </div>
        <div className="alert alert-error">
          <p>{error}</p>
          <button className="btn btn-outline" onClick={loadStats} style={{ marginTop: '0.5rem' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Reportes</h1>
        </div>
        <p className="empty-text">No hay datos disponibles</p>
      </div>
    );
  }

  const { summary, mostRequestedBooks, ordersByCategory, mostExpensiveBooks } = stats;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reportes</h1>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">📚</div>
          <div className="summary-info">
            <span className="summary-value">{summary.totalBooks}</span>
            <span className="summary-label">Libros registrados</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📦</div>
          <div className="summary-info">
            <span className="summary-value">{summary.activeOrders}</span>
            <span className="summary-label">Pedidos activos</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <span className="summary-value">${Number(summary.totalRevenue).toLocaleString()}</span>
            <span className="summary-label">Ingresos totales</span>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Libros más solicitados</h3>
          {mostRequestedBooks.length === 0 ? (
            <p className="empty-text">Sin datos</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {mostRequestedBooks.map((book, i) => (
                  <tr key={book.bookId}>
                    <td>{i + 1}</td>
                    <td>{book.title}</td>
                    <td><span className="badge">{book.quantity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="report-card">
          <h3>Frecuencia por categoría</h3>
          {ordersByCategory.length === 0 ? (
            <p className="empty-text">Sin datos</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {ordersByCategory.map((cat, i) => (
                  <tr key={i}>
                    <td>{cat.category}</td>
                    <td><span className="badge">{cat.quantity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="report-card">
          <h3>Libros más caros</h3>
          {mostExpensiveBooks.length === 0 ? (
            <p className="empty-text">Sin datos</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {mostExpensiveBooks.map((book, i) => (
                  <tr key={book.id}>
                    <td>{i + 1}</td>
                    <td>{book.title}</td>
                    <td>${Number(book.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
