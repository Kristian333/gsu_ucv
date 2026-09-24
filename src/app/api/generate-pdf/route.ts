import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json();

    const executablePath =
      process.env.CHROMIUM_EXECUTABLE_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      defaultViewport: { width: 1280, height: 1024 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    
    // Inyectamos el HTML estructurado
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

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
        "Content-Disposition": 'attachment; filename="Documento_Institucional.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error en API PDF:", error);
    return NextResponse.json({ error: error.message || "Error al generar PDF" }, { status: 500 });
  }
}