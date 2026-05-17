import { useState, useEffect } from 'react';
import './MainPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export default function MainPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : '';

    fetch(`${API_URL}/books${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setBooks(data.items || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [searchQuery]);

  function getInitials(title) {
    return title
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  function getColor(id) {
    return COLORS[Number(id) % COLORS.length];
  }

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="header-container">
          <div className="header-top">
            <div className="logo">BuscaLibro</div>

            <div className="search-wrapper">
              <input
                className="search-bar"
                type="text"
                placeholder="Buscar libros por título, autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>

            <div className="user-actions">
              <a href="/login" className="login-link">Iniciar sesión</a>
            </div>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <h1 className="hero-title">
          Descubre Nuevos Libros<br/>
          y Descuentos Exclusivos<br/>
          ¡Sumérgete en la lectura!
        </h1>
      </section>

      <main className="main-content">
        <aside className="sidebar">
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <span className="sidebar-indicator"></span>
              <a href="#" className="sidebar-link active">Todos los libros</a>
            </li>
          </ul>
        </aside>

        <section className="book-gallery">
          <h2 className="gallery-title">
            {searchQuery ? `Resultados para: "${searchQuery}"` : '¿Qué quieres leer hoy?'}
          </h2>

          {loading ? (
            <div className="loading">Cargando libros...</div>
          ) : error ? (
            <div className="alert alert-error">Error al cargar: {error}</div>
          ) : books.length === 0 ? (
            <p className="empty-text">No se encontraron libros</p>
          ) : (
            <div className="book-grid">
              {books.map((book) => (
                <article key={book.id} className="book-card">
                  <div className="book-cover" style={{ background: getColor(book.id) }}>
                    <span className="book-initials">{getInitials(book.title)}</span>
                  </div>

                  <div className="book-info">
                    <div>
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">{book.authors?.join(', ')}</p>
                      {book.availability === 'Available' && (
                        <span className="availability-badge">Disponible</span>
                      )}
                    </div>

                    <div className="price-container">
                      <p className="current-price">${Number(book.price).toLocaleString()}</p>
                      <button className="add-btn">Agregar al carrito</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
