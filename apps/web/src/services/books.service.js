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

export const booksService = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.author) params.set('author', filters.author);
    if (filters.category) params.set('category', filters.category);
    if (filters.availability) params.set('availability', filters.availability);

    const query = params.toString();
    const res = await fetch(
      `${API_URL}/books${query ? '?' + query : ''}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(res);
  },

  async getById(id) {
    const res = await fetch(`${API_URL}/books/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async lookup(value) {
    const res = await fetch(`${API_URL}/books/lookup?value=${encodeURIComponent(value)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async create(bookData) {
    const res = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookData),
    });
    return handleResponse(res);
  },

  async update(id, bookData) {
    const res = await fetch(`${API_URL}/books/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookData),
    });
    return handleResponse(res);
  },

  async remove(id) {
    const res = await fetch(`${API_URL}/books/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
