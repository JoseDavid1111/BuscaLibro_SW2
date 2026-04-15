const { HttpError } = require("../../lib/http");

function validateLoginPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "Debe enviar un cuerpo JSON con email y password");
  }

  if (!payload.email || !payload.password) {
    throw new HttpError(400, "Los campos email y password son obligatorios");
  }

  return {
    email: String(payload.email).trim().toLowerCase(),
    password: String(payload.password),
  };
}

module.exports = {
  validateLoginPayload,
};
