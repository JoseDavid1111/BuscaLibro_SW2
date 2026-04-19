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
  router.get("/api/auth/me", me);

  router.get("/api/books", listBooks);
  router.get("/api/books/lookup", getBookLookup);
  router.get("/api/books/:id", getBookById);

  router.get("/api/orders", listOrders);
  router.post("/api/orders", createOrder);
  router.get("/api/orders/:id", getOrderById);
  router.put("/api/orders/:id", updateOrder);
  router.delete("/api/orders/:id", deleteOrder);

  router.get("/api/users/:userId/orders", getUserOrderHistory);

  router.get("/api/reports/statistics", getStatistics);

  router.get("/api/exchange/orders/export", exportOrders);
  router.post("/api/exchange/orders/import", importOrders);

  return router.handler;
}

module.exports = {
  createApp,
};
