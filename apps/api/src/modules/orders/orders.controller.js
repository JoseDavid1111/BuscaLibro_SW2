const { validateOrderPayload } = require("./orders.schema");
const {
  cancelOrder,
  createNewOrder,
  editOrder,
  findOrder,
  listAllOrders,
  listOrdersByUser,
} = require("./orders.service");

async function listOrders() {
  return {
    status: 200,
    body: {
      items: await listAllOrders(),
    },
  };
}

async function getOrderById({ params }) {
  return {
    status: 200,
    body: await findOrder(params.id),
  };
}

async function createOrder({ body }) {
  return {
    status: 201,
    body: await createNewOrder(validateOrderPayload(body)),
  };
}

async function updateOrder({ params, body }) {
  return {
    status: 200,
    body: await editOrder(params.id, validateOrderPayload(body)),
  };
}

async function deleteOrder({ params }) {
  return {
    status: 200,
    body: await cancelOrder(params.id),
  };
}

async function getUserOrderHistory({ params }) {
  return {
    status: 200,
    body: {
      userId: params.userId,
      items: await listOrdersByUser(params.userId),
    },
  };
}

module.exports = {
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrderHistory,
};
