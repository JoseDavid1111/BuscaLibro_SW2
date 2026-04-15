const { listOrders } = require("../../data/store");
const { HttpError } = require("../../lib/http");
const { createNewOrder } = require("../orders/orders.service");
const { validateOrderPayload } = require("../orders/orders.schema");

async function exportOrderPayload() {
  return {
    generatedAt: new Date().toISOString(),
    orders: await listOrders(),
  };
}

async function importOrderPayload(payload) {
  if (!Array.isArray(payload.orders)) {
    throw new HttpError(400, "El JSON debe incluir la propiedad orders como arreglo");
  }

  const results = [];
  for (const order of payload.orders) {
    results.push(
      await createNewOrder(
        validateOrderPayload({
          userId: order.userId,
          items: order.items,
          source: "json-import",
        })
      )
    );
  }

  return {
    imported: results.length,
    orders: results,
  };
}

module.exports = {
  exportOrderPayload,
  importOrderPayload,
};
