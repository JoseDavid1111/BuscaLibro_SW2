const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../../config');
const { db } = require('../../config/db');
const { findUserByCredentials, findUserById: findUserFromStore } = require('../../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

function usePostgres() {
  return config.dataSource === 'postgres';
}

async function loginUser(email, password) {
  let user;

  if (usePostgres()) {
    const dbUser = await db('usuarios').where({ correo: email, activo: true }).first();
    if (!dbUser) throw new Error('Credenciales inválidas');

    const passwordMatch = await bcrypt.compare(password, dbUser.contrasena);
    if (!passwordMatch) throw new Error('Credenciales inválidas');

    user = {
      id: String(dbUser.id_usuario),
      email: dbUser.correo,
      role: dbUser.rol,
    };
  } else {
    user = await findUserByCredentials({ email, password });
    if (!user) throw new Error('Credenciales inválidas');
  }

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
  if (usePostgres()) {
    const user = await db('usuarios').where({ id_usuario: id, activo: true }).first();
    if (!user) throw new Error('Usuario no encontrado');
    return {
      id: String(user.id_usuario),
      email: user.correo,
      role: user.rol,
      created_at: user.fecha_creacion,
    };
  }

  const user = await findUserFromStore(id);
  if (!user) throw new Error('Usuario no encontrado');
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: null,
  };
}

async function listAllUsers() {
  const { listUsers } = require('../../data/store');
  return listUsers();
}

module.exports = { loginUser, getUserById, listAllUsers };
