const { createRouter } = require("./lib/http");
const { login, me } = require("./modules/auth/auth.controller");
const {
  listBooks,
  getBookById,
  getBookLookup,
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
const { verifyToken } = require("./middlewares/auth.middleware");

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

  router.post("/api/auth/login", login);
  router.get("/api/auth/me", verifyToken, me);

  router.get("/api/books", verifyToken, listBooks);
  router.get("/api/books/lookup", verifyToken, getBookLookup);
  router.get("/api/books/:id", verifyToken, getBookById);

  router.get("/api/orders", verifyToken, listOrders);
  router.post("/api/orders", verifyToken, createOrder);
  router.get("/api/orders/:id", verifyToken, getOrderById);
  router.put("/api/orders/:id", verifyToken, updateOrder);
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
