const { createRouter } = require("./lib/http");
const {
  login, me, listUsers
} = require("./modules/auth/auth.controller");
const {
  listBooks,
  getBookById,
  getBookLookup,
  createBook,
  updateBook,
  deleteBook,
} = require("./modules/books/books.controller");
const {
  createOrder,
  deleteOrder,
  getOrderById,
  listOrders,
  updateOrder,
  getUserOrderHistory,
} = require("./modules/orders/orders.controller");
const { getStatistics } = require("./modules/reports/reports.controller");
const {
  exportOrders,
  importOrders,
} = require("./modules/exchange/exchange.controller");
const {
  listAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require("./modules/authors/authors.controller");
const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("./modules/categories/categories.controller");
const { verifyToken } = require("./middlewares/auth.middleware");
const { validateBody } = require("./middlewares/validate.middleware");
const { loginSchema } = require("./modules/auth/auth.schema");
const { createBookSchema, updateBookSchema } = require("./modules/books/books.schema");
const { createAuthorSchema, updateAuthorSchema } = require("./modules/authors/authors.schema");
const { createCategorySchema, updateCategorySchema } = require("./modules/categories/categories.schema");
const { createOrderSchema, updateOrderSchema } = require("./modules/orders/orders.schema");

function createApp() {
  const router = createRouter();

  router.get("/health", async () => ({
    status: 200,
    body: {
      ok: true,
      service: "BuscaLibro API",
      timestamp: new Date().toISOString(),
    },
  }));

  router.post("/api/auth/login", validateBody(loginSchema), login);
  router.get("/api/auth/me", verifyToken, me);
  router.get("/api/users", verifyToken, listUsers);

  router.get("/api/books", listBooks);
  router.get("/api/books/lookup", getBookLookup);
  router.get("/api/books/:id", getBookById);
  router.post("/api/books", verifyToken, validateBody(createBookSchema), createBook);
  router.put("/api/books/:id", verifyToken, validateBody(updateBookSchema), updateBook);
  router.delete("/api/books/:id", verifyToken, deleteBook);

  router.get("/api/authors", verifyToken, listAuthors);
  router.get("/api/authors/:id", verifyToken, getAuthorById);
  router.post("/api/authors", verifyToken, validateBody(createAuthorSchema), createAuthor);
  router.put("/api/authors/:id", verifyToken, validateBody(updateAuthorSchema), updateAuthor);
  router.delete("/api/authors/:id", verifyToken, deleteAuthor);

  router.get("/api/categories", verifyToken, listCategories);
  router.get("/api/categories/:id", verifyToken, getCategoryById);
  router.post("/api/categories", verifyToken, validateBody(createCategorySchema), createCategory);
  router.put("/api/categories/:id", verifyToken, validateBody(updateCategorySchema), updateCategory);
  router.delete("/api/categories/:id", verifyToken, deleteCategory);

  router.get("/api/orders", verifyToken, listOrders);
  router.post("/api/orders", verifyToken, validateBody(createOrderSchema), createOrder);
  router.get("/api/orders/:id", verifyToken, getOrderById);
  router.put("/api/orders/:id", verifyToken, validateBody(updateOrderSchema), updateOrder);
  router.delete("/api/orders/:id", verifyToken, deleteOrder);

  router.get("/api/users/:userId/orders", verifyToken, getUserOrderHistory);

  router.get("/api/reports/statistics", verifyToken, getStatistics);

  router.get("/api/exchange/orders/export", verifyToken, exportOrders);
  router.post("/api/exchange/orders/import", verifyToken, importOrders);

  return router.handler;
}

module.exports = {
  createApp,
};
