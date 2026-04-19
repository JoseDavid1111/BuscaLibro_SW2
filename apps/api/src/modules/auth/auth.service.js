const jwt = require("jsonwebtoken");
const { findUserByCredentials, findUserById } = require("../../data/store");
const { HttpError } = require("../../lib/http");

const JWT_SECRET = process.env.JWT_SECRET || "buscalibro-dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

async function loginUser(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");

  if (!normalizedEmail || !normalizedPassword) {
    throw new HttpError(400, "Email y password son obligatorios");
  }

  const user = await findUserByCredentials({
    email: normalizedEmail,
    password: normalizedPassword,
  });

  if (!user) {
    throw new HttpError(401, "Credenciales invalidas");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: serializeUser(user),
  };
}

async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  return serializeUser(user);
}

function readTokenFromHeaders(headers = {}) {
  const authHeader = headers.authorization || headers.Authorization;

  if (!authHeader || !String(authHeader).startsWith("Bearer ")) {
    throw new HttpError(401, "Token no proporcionado");
  }

  return String(authHeader).slice("Bearer ".length).trim();
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new HttpError(401, "Token invalido o expirado");
  }
}

function serializeUser(user) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

module.exports = {
  loginUser,
  getCurrentUser,
  readTokenFromHeaders,
  verifyAccessToken,
};
