const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // No enviamos token en el login para evitar errores 401 por tokens caducados
  const isAuthRoute = endpoint.includes('auth/login');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !isAuthRoute ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && !isAuthRoute) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
}