const { validateLoginPayload } = require("./auth.schema");
const { loginUser } = require("./auth.service");

async function login({ body }) {
  const credentials = validateLoginPayload(body);
  return {
    status: 200,
    body: await loginUser(credentials),
  };
}

module.exports = {
  login,
};
