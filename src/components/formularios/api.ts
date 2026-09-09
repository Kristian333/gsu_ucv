const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export async function apiRequest(
  endpoint: string, 
  options: RequestInit & { isPublic?: boolean } = {}
) {

  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const isAuthRoute = endpoint.includes('auth/login');

  const { isPublic, ...nativeOptions } = options; 

  const headers = new Headers(options.headers);

  if (token && !isAuthRoute) {
    headers.set('Authorization', `Bearer ${token}`);
  }

 
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  } else {
    headers.delete('Content-Type');
  }

  const response = await fetch(url, {
    ...nativeOptions,
    headers,
  });
  
  const text = await response.text();
  
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    
    throw new Error(data.message || 'Error en la petición');
  }
  return data;
}