const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

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
  let data: any = {};

  // Parseo seguro de JSON
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    // Busca claves comunes de error retornadas por el backend
    const errorMessage =
      data.error ||
      data.safe_message ||
      data.message ||
      data.mensaje ||
      `HTTP_${response.status}`;

    throw new Error(errorMessage);
  }
  return data;
}