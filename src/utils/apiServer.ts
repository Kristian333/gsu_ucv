// src/utils/apiServer.ts
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export async function apiServerRequest(
  endpoint: string, 
  options: RequestInit = {}
) {
  // Limpiamos las barras para evitar errores de concatenación errónea (ej: //groups)
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {};

  // Intentar obtener el token de las cookies de forma segura en el Servidor si hiciera falta
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // Si se ejecuta en un contexto donde "cookies()" no está disponible, no pasa nada
  }

  // Combinar con los headers que pases por parámetro
  Object.assign(headers, options.headers);

  // Manejo automático de Content-Type si no es FormData
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

  // Manejo de respuestas vacías (como un 204 No Content)
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición desde el servidor');
  }

  return data;
}