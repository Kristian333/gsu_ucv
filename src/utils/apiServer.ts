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
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
  } else {
    delete headers['Content-Type'];
    delete headers['content-type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let data: any = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
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