const { randomUUID } = require("node:crypto");
const { config } = require("../config");
const { HttpError } = require("../lib/http");

const users = [
  {
    id: "1",
    name: "Jose David Meneses",
    email: "jose@buscalibro.local",
    password: "123456",
    role: "Administrador",
    active: true,
  },
  {
    id: "2",
    name: "Thomas Rincon",
    email: "thomas@buscalibro.local",
    password: "123456",
    role: "Cliente",
    active: true,
  },
  {
    id: "3",
    name: "Mateo Delgado",
    email: "mateo@buscalibro.local",
    password: "123456",
    role: "Cliente",
    active: true,
  },
];

const books = [
  {
    id: "1",
    code: "BL-001",
    isbn: "9780307476463",
    title: "Cien anos de soledad",
    description: "Novela de realismo magico ambientada en Macondo.",
    authors: ["Gabriel Garcia Marquez"],
    category: "Novela",
    price: 69000,
    stock: 12,
    active: true,
  },
  {
    id: "2",
    code: "BL-002",
    isbn: "9789584282696",
    title: "La voragine",
    description: "Clasico colombiano sobre la selva y la explotacion.",
    authors: ["Jose Eustasio Rivera"],
    category: "Clasico",
    price: 52000,
    stock: 6,
    active: true,
  },
  {
    id: "3",
    code: "BL-003",
    isbn: "9780061120084",
    title: "Matar a un ruisenor",
    description: "Historia sobre justicia, infancia y prejuicio.",
    authors: ["Harper Lee"],
    category: "Drama",
    price: 48000,
    stock: 9,
    active: true,
  },
  {
    id: "4",
    code: "BL-004",
    isbn: "9788491050297",
    title: "Sapiens",
    description: "Ensayo sobre la historia de la humanidad.",
    authors: ["Yuval Noah Harari"],
    category: "Historia",
    price: 87000,
    stock: 4,
    active: true,
  },
  {
    id: "5",
    code: "BL-005",
    isbn: "9786073193006",
    title: "El principito",
    description: "Fabula sobre amistad, amor y sentido de la vida.",
    authors: ["Antoine de Saint-Exupery"],
    category: "Infantil",
    price: 35000,
    stock: 15,
    active: true,
  },
];

const orders = [
  {
    id: "1",
    userId: "2",
    status: "Pendiente",
    createdAt: "2026-04-10T14:00:00.000Z",
    updatedAt: "2026-04-10T14:00:00.000Z",
    source: "system",
    items: [
      { bookId: "1", quantity: 1, unitPrice: 69000 },
      { bookId: "5", quantity: 2, unitPrice: 35000 },
    ],
  },
];

syncInventoryFromOrders();

function usePostgres() {
  return config.dataSource === "postgres";
}

function getPostgres() {
  return require("./postgres");
}

async function findUserByCredentials(credentials) {
  if (usePostgres()) {
    return getPostgres().findUserByCredentials(credentials);
  }

  return (
    users.find(
      (candidate) =>
        candidate.email.toLowerCase() === credentials.email &&
        candidate.password === credentials.password &&
        candidate.active
    ) || null
  );
}

async function findUserById(userId) {
  if (usePostgres()) {
    return getPostgres().findUserById(userId);
  }

  return users.find((candidate) => candidate.id === String(userId) && candidate.active) || null;
}

async function listBooks(filters) {
  if (usePostgres()) {
    return getPostgres().listBooks(filters);
  }

  return books
    .filter((book) => book.active)
    .filter((book) => applyBookFilters(book, filters))
    .map((book) => ({
      ...book,
      availability: book.stock > 0 ? "Available" : "Reserved",
    }));
}

async function findBookById(bookId) {
  if (usePostgres()) {
    return getPostgres().findBookById(bookId);
  }

  const book = books.find((candidate) => candidate.id === String(bookId) && candidate.active);
  if (!book) {
    throw new HttpError(404, "Libro no encontrado");
  }

  return {
    ...book,
    availability: book.stock > 0 ? "Available" : "Reserved",
  };
}

async function lookupBook(value) {
  if (usePostgres()) {
    return getPostgres().lookupBook(value);
  }

  const key = String(value || "").trim().toLowerCase();
  const book = books.find((candidate) =>
    [candidate.id, candidate.code, candidate.isbn, candidate.title]
      .map((entry) => entry.toLowerCase())
      .includes(key)
  );

  if (!book) {
    throw new HttpError(
      404,
      "No se encontro un libro con ese codigo, ISBN o titulo exacto"
    );
  }

  return {
    ...book,
    availability: book.stock > 0 ? "Available" : "Reserved",
  };
}

async function listOrders() {
  if (usePostgres()) {
    return getPostgres().listOrders();
  }

  return orders.map(serializeOrder);
}

async function findOrderById(orderId) {
  if (usePostgres()) {
    return getPostgres().findOrderById(orderId);
  }

  const order = orders.find((candidate) => candidate.id === String(orderId));
  if (!order) {
    throw new HttpError(404, "Pedido no encontrado");
  }

  return serializeOrder(order);
}

async function createOrder(payload) {
  if (usePostgres()) {
    return getPostgres().createOrder(payload);
  }

  await ensureMemoryUser(payload.userId);
  const items = enrichMemoryItems(payload.items);
  assertMemoryStock(items);

  const now = new Date().toISOString();
  const order = {
    id: randomUUID(),
    userId: String(payload.userId),
    status: "Pendiente",
    source: payload.source || "manual",
    createdAt: now,
    updatedAt: now,
    items,
  };

  orders.push(order);
  syncInventoryFromOrders();
  return serializeOrder(order);
}

async function updateOrder(orderId, payload) {
  if (usePostgres()) {
    return getPostgres().updateOrder(orderId, payload);
  }

  await ensureMemoryUser(payload.userId);
  const current = orders.find((candidate) => candidate.id === String(orderId));
  if (!current) {
    throw new HttpError(404, "Pedido no encontrado");
  }

  if (current.status === "Cancelado") {
    throw new HttpError(409, "No se puede editar un pedido cancelado");
  }

  const items = enrichMemoryItems(payload.items);
  assertMemoryStockForUpdate(current, items);

  current.userId = String(payload.userId);
  current.items = items;
  current.updatedAt = new Date().toISOString();
  current.source = payload.source || current.source;

  syncInventoryFromOrders();
  return serializeOrder(current);
}

async function cancelOrder(orderId) {
  if (usePostgres()) {
    return getPostgres().cancelOrder(orderId);
  }

  const current = orders.find((candidate) => candidate.id === String(orderId));
  if (!current) {
    throw new HttpError(404, "Pedido no encontrado");
  }

  if (current.status === "Cancelado") {
    throw new HttpError(409, "El pedido ya no esta activo");
  }

  current.status = "Cancelado";
  current.updatedAt = new Date().toISOString();
  syncInventoryFromOrders();

  return serializeOrder(current);
}

async function listOrdersByUser(userId) {
  if (usePostgres()) {
    return getPostgres().listOrdersByUser(userId);
  }

  await ensureMemoryUser(userId);
  return orders
    .filter((order) => order.userId === String(userId))
    .map(serializeOrder);
}

async function getStatistics() {
  if (usePostgres()) {
    return getPostgres().getStatistics();
  }

  const activeOrders = orders.filter((order) => order.status !== "Cancelado");

  return {
    summary: {
      totalBooks: books.length,
      activeOrders: activeOrders.length,
      totalRevenue: activeOrders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce(
            (orderTotal, item) => orderTotal + item.quantity * item.unitPrice,
            0
          ),
        0
      ),
    },
    mostRequestedBooks: buildMostRequestedBooks(activeOrders),
    ordersByCategory: buildOrdersByCategory(activeOrders),
    mostExpensiveBooks: books
      .slice()
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map((book) => ({
        id: book.id,
        title: book.title,
        price: book.price,
      })),
  };
}

function serializeOrder(order) {
  const user = users.find((candidate) => candidate.id === order.userId);
  return {
    id: order.id,
    userId: order.userId,
    userName: user ? user.name : "Usuario desconocido",
    status: order.status,
    source: order.source,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    total: order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    items: order.items.map((item) => {
      const book = books.find((candidate) => candidate.id === item.bookId);
      return {
        bookId: item.bookId,
        title: book ? book.title : "Libro eliminado",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      };
    }),
  };
}

function enrichMemoryItems(items) {
  return items.map((item) => {
    const book = books.find((candidate) => candidate.id === String(item.bookId) && candidate.active);
    if (!book) {
      throw new HttpError(404, `El libro ${item.bookId} no existe`);
    }

    return {
      bookId: String(item.bookId),
      quantity: item.quantity,
      unitPrice: book.price,
    };
  });
}

function assertMemoryStock(items) {
  items.forEach((item) => {
    const book = books.find((candidate) => candidate.id === item.bookId);
    if (!book || book.stock < item.quantity) {
      throw new HttpError(409, `Stock insuficiente para el libro ${item.bookId}`);
    }
  });
}

function assertMemoryStockForUpdate(currentOrder, updatedItems) {
  const availableByBook = new Map(books.map((book) => [book.id, book.stock]));

  currentOrder.items.forEach((item) => {
    availableByBook.set(
      item.bookId,
      (availableByBook.get(item.bookId) || 0) + item.quantity
    );
  });

  updatedItems.forEach((item) => {
    const available = availableByBook.get(item.bookId) || 0;
    if (available < item.quantity) {
      throw new HttpError(409, `Stock insuficiente para el libro ${item.bookId}`);
    }
  });
}

async function ensureMemoryUser(userId) {
  const user = users.find((candidate) => candidate.id === String(userId) && candidate.active);
  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }
}

function syncInventoryFromOrders() {
  const baseStock = { 1: 12, 2: 6, 3: 9, 4: 4, 5: 15 };

  books.forEach((book) => {
    book.stock = baseStock[book.id];
  });

  orders
    .filter((order) => order.status !== "Cancelado")
    .forEach((order) => {
      order.items.forEach((item) => {
        const book = books.find((candidate) => candidate.id === item.bookId);
        if (book) {
          book.stock -= item.quantity;
        }
      });
    });
}

function applyBookFilters(book, filters) {
  if (filters.q) {
    const haystack = [
      book.id,
      book.code,
      book.isbn,
      book.title,
      book.description,
      ...book.authors,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(filters.q)) {
      return false;
    }
  }

  if (filters.author) {
    const matchesAuthor = book.authors.some((author) =>
      author.toLowerCase().includes(filters.author)
    );
    if (!matchesAuthor) {
      return false;
    }
  }

  if (filters.category && !book.category.toLowerCase().includes(filters.category)) {
    return false;
  }

  if (filters.availability) {
    const availability = book.stock > 0 ? "available" : "reserved";
    if (availability !== filters.availability) {
      return false;
    }
  }

  return true;
}

function buildMostRequestedBooks(activeOrders) {
  const totals = new Map();
  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      totals.set(item.bookId, (totals.get(item.bookId) || 0) + item.quantity);
    });
  });

  return Array.from(totals.entries())
    .map(([bookId, quantity]) => {
      const book = books.find((candidate) => candidate.id === bookId);
      return {
        bookId,
        title: book ? book.title : "Libro desconocido",
        quantity,
      };
    })
    .sort((a, b) => b.quantity - a.quantity);
}

function buildOrdersByCategory(activeOrders) {
  const totals = new Map();
  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      const book = books.find((candidate) => candidate.id === item.bookId);
      if (!book) {
        return;
      }
      totals.set(book.category, (totals.get(book.category) || 0) + item.quantity);
    });
  });

  return Array.from(totals.entries())
    .map(([category, quantity]) => ({ category, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
}

module.exports = {
  findUserByCredentials,
  findUserById,
  listBooks,
  findBookById,
  lookupBook,
  listOrders,
  findOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  listOrdersByUser,
  getStatistics,
};
