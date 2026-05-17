import { useState, useEffect, useCallback } from 'react';
import { booksService } from '../../services/books.service';
import { authorsService } from '../../services/authors.service';
import { categoriesService } from '../../services/categories.service';
import Modal from '../../components/ui/Modal';

const emptyBook = {
  isbn: '', title: '', description: '', authorId: '',
  categoryId: '', editorial: '', anioPublicacion: '', price: '', stock: '', code: '',
};

export default function InventoryPage() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', author: '', category: '', availability: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [booksRes, authorsRes, categoriesRes] = await Promise.all([
        booksService.list(filters),
        authorsService.list(),
        categoriesService.list(),
      ]);
      setBooks(booksRes.items || booksRes);
      setAuthors(authorsRes);
      setCategories(categoriesRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyBook);
    setError('');
    setModalOpen(true);
  }

  function openEdit(book) {
    setEditingId(book.id);
    setError('');
    setForm({
      code: book.code || '',
      isbn: book.isbn || '',
      title: book.title || '',
      description: book.description || '',
      authorId: book.authorId || '',
      categoryId: book.categoryId || '',
      editorial: book.editorial || '',
      anioPublicacion: book.anioPublicacion || '',
      price: book.price || '',
      stock: book.stock || '',
    });
    setModalOpen(true);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        anioPublicacion: form.anioPublicacion ? Number(form.anioPublicacion) : undefined,
      };

      if (editingId) {
        await booksService.update(editingId, payload);
      } else {
        await booksService.create(payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book) {
    if (!window.confirm(`¿Eliminar "${book.title}"?`)) return;
    try {
      setError('');
      await booksService.remove(book.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Inventario</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo libro</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters-bar">
        <input className="filter-input" name="q" placeholder="Buscar..." value={filters.q} onChange={handleFilterChange} />
        <select className="filter-select" name="author" value={filters.author} onChange={handleFilterChange}>
          <option value="">Todos los autores</option>
          {authors.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
        </select>
        <select className="filter-select" name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select className="filter-select" name="availability" value={filters.availability} onChange={handleFilterChange}>
          <option value="">Todos los estados</option>
          <option value="available">Disponible</option>
          <option value="reserved">Reservado</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Cargando inventario...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr><td colSpan={8} className="empty-row">No hay libros registrados</td></tr>
              ) : books.map((book) => (
                <tr key={book.id}>
                  <td><span className="code-badge">{book.code}</span></td>
                  <td className="cell-title">{book.title}</td>
                  <td>{book.authors?.join(', ')}</td>
                  <td>{book.category}</td>
                  <td><span className={`stock-badge ${book.stock > 0 ? 'stock-ok' : 'stock-low'}`}>{book.stock}</span></td>
                  <td>${Number(book.price).toLocaleString()}</td>
                  <td><span className={`status-badge ${book.stock > 0 ? 'status-available' : 'status-reserved'}`}>{book.stock > 0 ? 'Disponible' : 'Reservado'}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(book)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(book)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar libro' : 'Nuevo libro'}>
        <form onSubmit={handleSave} className="crud-form">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="title">Título *</label>
              <input id="title" name="title" value={form.title} onChange={handleFormChange} required />
            </div>
            <div className="field">
              <label htmlFor="isbn">ISBN *</label>
              <input id="isbn" name="isbn" value={form.isbn} onChange={handleFormChange} required />
            </div>
            <div className="field">
              <label htmlFor="code">Código interno</label>
              <input id="code" name="code" value={form.code} onChange={handleFormChange} placeholder="BL-XXX" />
            </div>
            <div className="field">
              <label htmlFor="authorId">Autor *</label>
              <select id="authorId" name="authorId" value={form.authorId} onChange={handleFormChange} required>
                <option value="">Seleccionar autor</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="categoryId">Categoría *</label>
              <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleFormChange} required>
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="editorial">Editorial</label>
              <input id="editorial" name="editorial" value={form.editorial} onChange={handleFormChange} />
            </div>
            <div className="field">
              <label htmlFor="anioPublicacion">Año publicación</label>
              <input id="anioPublicacion" name="anioPublicacion" type="number" value={form.anioPublicacion} onChange={handleFormChange} />
            </div>
            <div className="field">
              <label htmlFor="price">Precio *</label>
              <input id="price" name="price" type="number" step="0.01" value={form.price} onChange={handleFormChange} required />
            </div>
            <div className="field">
              <label htmlFor="stock">Stock *</label>
              <input id="stock" name="stock" type="number" value={form.stock} onChange={handleFormChange} required />
            </div>
            <div className="field field-full">
              <label htmlFor="description">Descripción</label>
              <textarea id="description" name="description" rows={3} value={form.description} onChange={handleFormChange} />
            </div>
          </div>
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
