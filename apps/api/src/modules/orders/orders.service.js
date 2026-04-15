const {
  createOrder,
  updateOrder,
  cancelOrder,
  listOrders,
  findOrderById,
  listOrdersByUser,
  findUserById,
} = require("../../data/store");
const { HttpError } = require("../../lib/http");

async function listAllOrders() {
  return listOrders();
}

async function findOrder(orderId) {
  return findOrderById(orderId);
}

async function createNewOrder(payload) {
  return createOrder(payload);
}

async function editOrder(orderId, payload) {
  return updateOrder(orderId, payload);
}

async function removeOrder(orderId) {
  return cancelOrder(orderId);
}

async function getOrdersHistoryByUser(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  return listOrdersByUser(userId);
}

module.exports = {
  listAllOrders,
  findOrder,
  createNewOrder,
  editOrder,
  cancelOrder: removeOrder,
  listOrdersByUser: getOrdersHistoryByUser,
};
