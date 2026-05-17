const { loginUser, getUserById, listAllUsers } = require('./auth.service');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (err) {
    const status = err.message === 'Credenciales inválidas' ? 401 : 500;
    res.status(status).json({ error: err.message });
  }
}

async function listUsers(req) {
  const users = await listAllUsers();
  return { status: 200, body: users };
}

async function me(req, res) {
  try {
    const user = await getUserById(req.userId);
    res.json({ user });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = { login, me, listUsers };
