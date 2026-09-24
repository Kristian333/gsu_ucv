import { NextRequest, NextResponse } from "next/server";

// Si estamos en Docker usa 'http://backend:8081', si estamos en local usa 'http://localhost:8081'
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8081";

type FetchInit = RequestInit & { duplex?: "half" };

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const pathString = params.path.join("/");
  const searchParams = req.nextUrl.search;
  const targetUrl = `${INTERNAL_API_URL.replace(/\/$/, "")}/${pathString}${searchParams}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  try {
    const hasBody = req.method !== "GET" && req.method !== "HEAD";

    const fetchInit: FetchInit = {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      cache: "no-store",
    };

    if (hasBody) {
      fetchInit.duplex = "half";
    }

    const res = await fetch(targetUrl, fetchInit);

    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch (error) {
    console.error("Error en Proxy API Route:", error);
    return NextResponse.json(
      { message: "Error de conexión con el backend interno" },
      { status: 502 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };