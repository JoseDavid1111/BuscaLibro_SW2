const { findUserByCredentials } = require("../../data/store");
const { HttpError } = require("../../lib/http");

async function loginUser(credentials) {
  const user = await findUserByCredentials(credentials);

  if (!user) {
    throw new HttpError(401, "Credenciales invalidas");
  }

  return {
    token: `mock-token-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  loginUser,
};
