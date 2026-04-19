const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Error inesperado');
  }
  return data;
}

export const reportsService = {
  async getStatistics() {
    const res = await fetch(`${API_URL}/reports/statistics`);
    return handleResponse(res);
  },
};
