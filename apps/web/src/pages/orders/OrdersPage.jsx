import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '../../services/orders.service';
import { booksService } from '../../services/books.service';
import { usersService } from '../../services/users.service';
import Modal from '../../components/ui/Modal';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ userId: '', items: [{ bookId: '', quantity: 1 }] });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [ordersRes, usersRes, booksRes] = await Promise.all([
        ordersService.list(),
        usersService.list(),
        booksService.list(),
      ]);
      setOrders(ordersRes.items || ordersRes);
      setUsers(usersRes);
      setBooks(booksRes.items || booksRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function openCreate() {
    setEditingId(null);
    setForm({ userId: '', items: [{ bookId: '', quantity: 1 }] });
    setError('');
    setModalOpen(true);
  }

  function openEdit(order) {
    setEditingId(order.id);
    setError('');
    setForm({
      userId: order.userId,
      items: order.items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
    });
    setModalOpen(true);
  }

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleItemChange(index, field, value) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { bookId: '', quantity: 1 }] }));
  }

  function removeItem(index) {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items };
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        userId: form.userId,
        items: form.items.map((item) => ({
          bookId: item.bookId,
          quantity: Number(item.quantity),
        })),
      };

      if (editingId) {
        await ordersService.update(editingId, payload);
      } else {
        await ordersService.create(payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(order) {
    if (!window.confirm(`¿Cancelar el pedido #${order.id}?`)) return;
    try {
      setError('');
      await ordersService.cancel(order.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const statusLabels = {
    Pendiente: { label: 'Pendiente', className: 'status-pending' },
    Cancelado: { label: 'Cancelado', className: 'status-cancelled' },
    Completado: { label: 'Completado', className: 'status-completed' },
  };

  function getItemTotal(items) {
    return items.reduce((sum, i) => sum + (Number(i.unitPrice) * Number(i.quantity) || 0), 0);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Pedidos</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo pedido</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Cargando pedidos...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No hay pedidos registrados</td></tr>
              ) : orders.map((order) => {
                const st = statusLabels[order.status] || { label: order.status, className: '' };
                return (
                  <tr key={order.id}>
                    <td><span className="code-badge">#{order.id?.slice(0, 8)}</span></td>
                    <td>{order.userName}</td>
                    <td><span className={`status-badge ${st.className}`}>{st.label}</span></td>
                    <td>${Number(order.total || getItemTotal(order.items)).toLocaleString()}</td>
                    <td className="cell-date">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                        {expandedId === order.id ? 'Ocultar' : 'Ver'}
                      </button>
                      {order.status !== 'Cancelado' && (
                        <>
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(order)}>Editar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleCancel(order)}>Cancelar</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {expandedId && (() => {
            const order = orders.find((o) => o.id === expandedId);
            if (!order) return null;
            return (
              <div className="order-details">
                <h3>Detalle del pedido #{order.id?.slice(0, 8)}</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Libro</th>
                      <th>Cantidad</th>
                      <th>Precio unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item, i) => (
                      <tr key={i}>
                        <td>{item.title || 'Libro #' + item.bookId}</td>
                        <td>{item.quantity}</td>
                        <td>${Number(item.unitPrice).toLocaleString()}</td>
                        <td>${Number(item.subtotal || item.quantity * item.unitPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan={3}>Total</td>
                      <td>${Number(order.total || getItemTotal(order.items)).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar pedido' : 'Nuevo pedido'}>
        <form onSubmit={handleSave} className="crud-form">
          <div className="field">
            <label htmlFor="userId">Usuario *</label>
            <select id="userId" name="userId" value={form.userId} onChange={handleFormChange} required>
              <option value="">Seleccionar usuario</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>

          <h4>Libros</h4>
          {form.items.map((item, index) => (
            <div key={index} className="order-item-row">
              <div className="field">
                <label>Libro</label>
                <select value={item.bookId} onChange={(e) => handleItemChange(index, 'bookId', e.target.value)} required>
                  <option value="">Seleccionar libro</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.stock <= 0}>
                      {b.title} - ${Number(b.price).toLocaleString()} ({b.stock} disp.)
                    </option>
                  ))}
                </select>
              </div>
              <div className="field field-qty">
                <label>Cantidad</label>
                <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
              </div>
              {form.items.length > 1 && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>X</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>+ Agregar libro</button>

          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
