const { HttpError } = require("../../lib/http");
const { exportOrderPayload, importOrderPayload } = require("./exchange.service");

async function exportOrders() {
  return {
    status: 200,
    body: await exportOrderPayload(),
  };
}

async function importOrders({ body }) {
  if (!body) {
    throw new HttpError(400, "Debe enviar un archivo JSON en el cuerpo de la solicitud");
  }

  return {
    status: 201,
    body: await importOrderPayload(body),
  };
}

module.exports = {
  exportOrders,
  importOrders,
};
