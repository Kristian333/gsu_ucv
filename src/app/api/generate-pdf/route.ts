import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json();
    const isLocal = process.env.NODE_ENV === "development";

    const browser = await puppeteer.launch({
      args: isLocal ? ["--no-sandbox"] : chromium.args,
      defaultViewport: { width: 1280, height: 1024 },
      executablePath: isLocal
        ? process.env.CHROMIUM_EXECUTABLE_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    // Inyectamos el HTML estructurado
    await page.setContent(htmlContent, { waitUntil: "load" });

    // Generamos el PDF con las dimensiones exactas de hoja Carta (Letter)
    // El margen superior (2.54cm), izquierdo/derecho (2.54cm) e inferior (4.15cm) se controlan por CSS para el layout
    const pdfUint8Array = await page.pdf({
      format: "Letter", // 21.59 cm x 27.94 cm
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    const pdfBuffer = Buffer.from(pdfUint8Array);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=Documento_Institucional.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error en API PDF:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}