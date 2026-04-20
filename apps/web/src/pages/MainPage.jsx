import React from "react";
import "./MainPage.css";

const books = [
  {
    id: 1,
    title: "LA HORA DE LOS LOBOS",
    author: "MENDOZA, MARIO",
    price: "$ 71,100.00",
    oldPrice: "$ 79,000.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcovMV0ngOM5Yo6be2c521Cq5R3N-cFtUQGVIHQt7whZDkjuHtIVSilpQJEvRRhUM67hMVdfr9g8AezRsfOKq8kVqtELOsOlt_appvGRQ9Qu2Ik5C0YSe2RdMQJHs9KtZmKRDEzxUzfkg5p5KySxmjWXtWFgfLkCgk4DaMSfsTGLMIFLp0fEaYSsPslYcQEYWARsIlFT4Z1uEug10UdyOCceLI3KO7R_uY0G1oKvB1lEzB5BtVzJTzi0eE5D0WrwFlFluI5DNb1js",
    available: false,
  },
  {
    id: 2,
    title: "ISLANDIA",
    author: "VILAS, MANUEL",
    price: "$ 60,000.00",
    oldPrice: "$ 75,600.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBX9niH_QD11gCLJYY5RSu-xec1mtUo9MdobnnKV-JLV9MRaW8XPJ0AQOmzimsWbDoiUvNqpGmtv0Y1JAuH1rXVfP_encoui1nYTszwKcDnE7mcgqNpRbrYQbUB1gs9YIyC4z-gPboDHbMMi7TwIw1TsyFg7pfhKJBoLlB-vm0-DXac0JRLkVyRtCaaj0PYWCWa8vsyXF4IkGbLGezd7U8JJ85KBo8wJ73OJi0fFlbq4iZJxlTxCrDYdRBn6ZhlAfL_Mu8oMBPgFic",
    available: true,
  },
  {
    id: 3,
    title: "CUENTOS Y RELATOS...",
    author: "GIRALDO, LUZ MARY",
    price: "$ 59,400.00",
    oldPrice: "$ 66,000.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAj5oVS_grOFs7FK1_C_2eixUKhWVY12pxjg5G3dVmZ8pSFbBHAs8r9X2SfIxX7rMHV7a3f75mleL2fZTk3uG5OKMotQkFsrNl_qYj6RES7DenTbAZulQpvkcRYYlPQP3MCxLd935dzcqxpvrC2XBJIc7OBIubKJFbDfZDB7Hm4mqMrfDr53RyGafyqFOK28wk-Vbgdhn519-WJe_IuScQwq_zqUxDRSNsKR4WKSgLNLFPoezC30lUwFKkRoCoDhwBvJQEfjbWtIsg",
    available: false,
  },
  {
    id: 4,
    title: "EL VIAJE INÚTIL",
    author: "SOSA VILLADA, CAMILA",
    price: "$ 40,500.00",
    oldPrice: "$ 45,000.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7GFnWyf-d2SnQ0VC2RfrWVb5gvmNxx6pfPhrNC7-zPUKwmwFJ0IqURvsrcpr07VidssoavgKR9l3sQYMbFaxJsgNgSs9RtABbB45jiVRiMQxyUIggsgLBy65pOU-9lu3K4DeWNkYawVG4SawytdwYGlxLztIOWQZbWuRmJik3TfvKk4fClNmDX-m1TxBpuXER17uS8CgX_JoiCQp4JzCEJH9DIn-otoBPceSmwHpleHYEFVPHRxGCGSbSSuWyAw0xWqJViySbsyo",
    available: true,
  },
  {
    id: 5,
    title: "UN MAL SALVAJE",
    author: "COETZEE, JOHN MAXWELL",
    price: "$ 53,100.00",
    oldPrice: "$ 59,000.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwXYqSdAZyrRdB4733rikqcQqaOFGGXaKD_0-_M4NkzoYpNRhBX7DuFS00EG0-aXn-ha1ka0GqHnWz98I8ec9gKYvZpdGGFuPGJyHlWfzyJ3pv0sF5trWCV3IrbGb1PRHniPBlkZ1nc2oMhZHkkFH5JcFSRyAfc1H0mTWVny0-jRmsMFE9gyqoJ8qAPUz_I68B8vBRV_PqTri3CcVApr-ZvQeVsrZs5NoybqRDwkzpEbhwZ2M-U2l4CRDURwZEEqvjMPz2mu8PRDk",
    available: true,
  },
  {
    id: 6,
    title: "LA HIJA",
    author: "DEL MOLINO, SERGIO",
    price: "$ 80,100.00",
    oldPrice: "$ 89,000.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjO52XOc2vYyd90OktuK5hTXjmD977zo0-tUc0_JhnjKpkJN-ODmkcugPc7SIgzEBm-ZngA5N0uloV87F8ZWT2Hmof9eK232TwhLeXVxsMqmKq8WToDZ-Ipv_WFYrwxSgcewHtiLdj-q1pI8_PpAey7bS1bRp5ird5uKWGTB50rls3rLnHN66apBlABcfoKAUlphLzd6j0gCZf2HqpsSNj_u-ufDvCxeGYr-erbGRzYYC4d-RdhokKlWeRdNNKOIY2wXorVi5Hpo4",
    available: true,
  },
];

const MainPage = () => {
  return (
    <div className="main-page">
      {/* HEADER SECTION */}
      <header className="main-header">
        <div className="header-container">
          <div className="header-top">
            {/* Logo */}
            <div className="logo">BuscaLibro</div>
            
            {/* Search Bar */}
            <div className="search-wrapper">
              <input className="search-bar" type="text" placeholder="" />
              <div className="search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>

            {/* User Actions */}
            <div className="user-actions">
              <button className="icon-btn">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                </svg>
              </button>
              <button className="icon-btn">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                </svg>
              </button>
            </div>
          </div>


        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <h1 className="hero-title">
          Descubre Nuevas Sagas<br/>
          Eventos y Descuentos Exclusivos<br/>
          ¡Sumérgete en la lectura!
        </h1>
      </section>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <span className="sidebar-indicator"></span>
              <a href="#" className="sidebar-link active">Novedades</a>
            </li>
            <li className="sidebar-item-plain">
              <a href="#" className="sidebar-link">Populares</a>
            </li>
            <li className="sidebar-item-plain">
              <a href="#" className="sidebar-link">Descuentos</a>
            </li>
          </ul>
        </aside>

        {/* GALLERY */}
        <section className="book-gallery">
          <h2 className="gallery-title">¿Qué quieres leer hoy?</h2>
          
          <div className="book-grid">
            {books.map((book) => (
              <article key={book.id} className="book-card">
                {/* Book Cover */}
                <div className="book-cover">
                  <img alt={book.title} className="book-img" src={book.image} />
                </div>

                {/* Book Info */}
                <div className="book-info">
                  <div>
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                    {book.available && <span className="availability-badge">Disponible</span>}
                  </div>

                  <div className="price-container">
                    <div>
                      <p className="current-price">{book.price}</p>
                      <p className="old-price">{book.oldPrice}</p>
                    </div>
                    <button className="add-btn">Agregar al carrito</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
