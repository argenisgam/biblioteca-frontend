const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
export const TOKEN_KEY = 'biblioteca_token';

export async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (response.status === 401 && path !== '/auth/login') {
    window.dispatchEvent(new Event('biblioteca:unauthorized'));
  }
  if (!response.ok) {
    throw new Error(data?.mensaje || data?.message || `Error ${response.status}: no se pudo completar la solicitud.`);
  }
  return data;
}

export const authApi = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (credentials) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  currentUser: () => request('/auth/me'),
};

export const api = {
  books: () => request('/libros'),
  users: () => request('/usuarios'),
  loans: async () => {
    const rows = await request('/prestamos');
    return Array.isArray(rows) ? rows.map((row) => ({
      ...row,
      usuario: row.usuario ?? row.Usuario?.nombre ?? row.usuario?.nombre,
      libro: row.libro ?? row.Libro?.titulo ?? row.libro?.titulo,
    })) : rows;
  },
  saveBook: (book, id) => request(id ? `/libros/${id}` : '/libros', { method: id ? 'PUT' : 'POST', body: JSON.stringify(book) }),
  deleteBook: (id) => request(`/libros/${id}`, { method: 'DELETE' }),
  saveUser: (user, id) => request(id ? `/usuarios/${id}` : '/usuarios', { method: id ? 'PUT' : 'POST', body: JSON.stringify(user) }),
  deleteUser: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
  createLoan: (loan) => request('/prestamos', { method: 'POST', body: JSON.stringify(loan) }),
  returnLoan: (id) => request(`/prestamos/devolver/${id}`, { method: 'PUT' }),
};
