const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {

  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
 
  const isAuthRoute = endpoint.includes('auth/login');

 
  const headers: Record<string, string> = {
    ...(token && !isAuthRoute ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers, 
  };

 
  if (!(options.body instanceof FormData)) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  } else {
   
    delete headers['Content-Type'];
  }

 
  const response = await fetch(url, {
    ...options,
    headers,
  });

  
  const data = await response.json();

  if (!response.ok) {
    
    if (response.status === 401 && !isAuthRoute) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
}