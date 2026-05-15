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

export const ordersService = {
  async list() {
    const res = await fetch(`${API_URL}/orders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getById(id) {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async create(orderData) {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  async update(id, orderData) {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  async cancel(id) {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getUserHistory(userId) {
    const res = await fetch(`${API_URL}/users/${userId}/orders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
