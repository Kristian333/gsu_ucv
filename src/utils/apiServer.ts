// src/utils/apiServer.ts
import { cookies } from "next/headers";

// Si estamos en el servidor, usamos INTERNAL_API_URL (http://backend:8081 en prod, o http://localhost:8081 en local)
const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export async function apiServerRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const headers: Record<string, string> = {};

  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}

  Object.assign(headers, options.headers);

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

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición desde el servidor');
  }

  return data;
}