const { z } = require('zod');
const { HttpError } = require("../../lib/http");

const orderItemSchema = z.object({
  bookId: z.union([z.string(), z.number()]).transform(String),
  quantity: z.number().int().positive('La cantidad debe ser un entero mayor que cero'),
});

const createOrderSchema = z.object({
  userId: z.union([z.string(), z.number()]).transform(String),
  items: z.array(orderItemSchema).min(1, 'El pedido debe incluir al menos un libro'),
  source: z.string().optional().default('manual'),
});

const updateOrderSchema = z.object({
  userId: z.union([z.string(), z.number()]).transform(String).optional(),
  items: z.array(orderItemSchema).min(1, 'El pedido debe incluir al menos un libro').optional(),
  source: z.string().optional(),
});

function validateOrderPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "Debe enviar un pedido valido");
  }

  if (!payload.userId) {
    throw new HttpError(400, "El campo userId es obligatorio");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new HttpError(400, "El pedido debe incluir al menos un libro");
  }

  const items = payload.items.map((item, index) => {
    if (!item.bookId) {
      throw new HttpError(400, `El item ${index + 1} no contiene bookId`);
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new HttpError(400, `La cantidad del item ${index + 1} debe ser un entero mayor que cero`);
    }

    return {
      bookId: String(item.bookId),
      quantity,
    };
  });

  return {
    userId: String(payload.userId),
    items,
    source: payload.source ? String(payload.source) : "manual",
  };
}

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  validateOrderPayload,
};
