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

export const usersService = {
  async list() {
    const res = await fetch(`${API_URL}/users`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
};
