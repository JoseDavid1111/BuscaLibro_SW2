import React from "react";
import "./MainPage.css";

const books = [
  { id: 1, title: "Titulo de libro", author: "Autor", price: "$$$" },
  { id: 2, title: "Titulo de libro", author: "Autor", price: "$$$" },
  { id: 3, title: "Titulo de libro", author: "Autor", price: "$$$" },
];

const MainPage = () => {
  return (
    <div className="main-container">
      {/* Header */}
      <header className="navbar">
        <div className="logo">BuscaLibro</div>

        <input
          type="text"
          className="search-bar"
          placeholder="Titulo, autor, ISBN ..."
        />

        <div className="nav-icons">
          <span className="icon">🛒</span>
          <span className="icon">👤</span>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <p>
          Informacion sobre nuevas sagas <br />
          de libros por salir, eventos o <br />
          descuentos
        </p>
      </section>

      {/* Content */}
      <div className="content">
        {/* Sidebar */}
        <aside className="sidebar">
          <p> Novedades</p>
          <p> Populares</p>
          <p> Descuentos</p>
        </aside>

        {/* Main Section */}
        <main className="main">
          <h2>Bienvenido a BuscaLibro</h2>
          <p>¿Que quieres leer hoy?</p>

          <div className="book-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-image">Portada del libro</div>
                <h4>{book.title}</h4>
                <p>{book.author}</p>
                <p>{book.price}</p>
                <button>Agregar al carrito</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainPage;
