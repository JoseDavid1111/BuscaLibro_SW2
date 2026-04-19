const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

async function loginUser(email, password) {
  const user = await db('users').where({ email }).first();

  if (!user) throw new Error('Credenciales inválidas');

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

async function getUserById(id) {
  const user = await db('users').where({ id }).select('id', 'email', 'role', 'created_at').first();
  if (!user) throw new Error('Usuario no encontrado');
  return user;
}

module.exports = { loginUser, getUserById };
