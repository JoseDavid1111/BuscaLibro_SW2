const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Error inesperado');
  return data;
}

export const authorsService = {
  async list() {
    const res = await fetch(`${API_URL}/authors`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getById(id) {
    const res = await fetch(`${API_URL}/authors/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async create(data) {
    const res = await fetch(`${API_URL}/authors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async update(id, data) {
    const res = await fetch(`${API_URL}/authors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async remove(id) {
    const res = await fetch(`${API_URL}/authors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
