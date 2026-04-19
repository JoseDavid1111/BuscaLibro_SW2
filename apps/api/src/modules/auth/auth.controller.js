const { HttpError } = require("../../lib/http");
const {
  loginUser,
  getCurrentUser,
  readTokenFromHeaders,
  verifyAccessToken,
} = require("./auth.service");

async function login({ body }) {
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    throw new HttpError(400, "Los campos email y password son obligatorios");
  }

  return {
    status: 200,
    body: await loginUser(email, password),
  };
}

async function me({ req }) {
  const token = readTokenFromHeaders(req.headers);
  const payload = verifyAccessToken(token);
  const user = await getCurrentUser(payload.userId);

  return {
    status: 200,
    body: { user },
  };
}

module.exports = {
  login,
  me,
};
