// lib/pdfLayout.ts

export const PAGE_LAYOUT = {
  PAGE_WIDTH_MM: 215.9,
  PAGE_HEIGHT_MM: 279.4,
  MARGIN_X_MM: 25.4, // margenes izquierdo y derecho

  HEADER_TOP_MM: 15, // separación del borde superior de la pagina
  HEADER_HEIGHT_MM: 35, // espacio header

  FOOTER_BOTTOM_MM: 15, // separación del borde inferior de la pagina
  FOOTER_HEIGHT_MM: 30, // espacio footer
} as const;

// Espacio total que hay que "reservar" arriba y abajo en cada página para que el contenido jamás se dibuje encima del header/footer.
export const HEADER_SPACE_MM =
  PAGE_LAYOUT.HEADER_TOP_MM + PAGE_LAYOUT.HEADER_HEIGHT_MM; // 70mm
export const FOOTER_SPACE_MM =
  PAGE_LAYOUT.FOOTER_BOTTOM_MM + PAGE_LAYOUT.FOOTER_HEIGHT_MM; // 49mm

export const CONTENT_WIDTH_MM =
  PAGE_LAYOUT.PAGE_WIDTH_MM - 2 * PAGE_LAYOUT.MARGIN_X_MM; // 165.1mm
export const CONTENT_HEIGHT_MM =
  PAGE_LAYOUT.PAGE_HEIGHT_MM - HEADER_SPACE_MM - FOOTER_SPACE_MM; // ~160.4mm


export const LETTER_CONTENT_CSS = `
  .rich-text-preview, .content-body { font-family: Arial, Helvetica, sans-serif !important; }
  .rich-text-preview *, .content-body * { font-family: Arial, Helvetica, sans-serif !important; }

  .rich-text-preview table, .content-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    page-break-inside: auto;
  }
  .rich-text-preview th, .rich-text-preview td,
  .content-body th, .content-body td {
    border: 1px solid #000000 !important;
    padding: 8px;
    font-size: 10.5pt;
  }
  .rich-text-preview th, .content-body th {
    background-color: #f7fafc !important;
    font-weight: bold;
  }
  /* Repite la fila de encabezado de la tabla en cada página nueva */
  .rich-text-preview thead, .content-body thead {
    display: table-header-group;
  }
  /* Evita que una fila o un párrafo se corte justo en el borde de página */
  .rich-text-preview tr, .content-body tr,
  .rich-text-preview p, .content-body p,
  .rich-text-preview li, .content-body li {
    page-break-inside: avoid;
    break-inside: avoid-page;
  }

  .rich-text-preview ul, .content-body ul { padding-left: 24px; list-style-type: disc; margin-bottom: 8px; }
  .rich-text-preview ul ul, .content-body ul ul { list-style-type: circle; margin-top: 4px; }
  .rich-text-preview ul ul ul, .content-body ul ul ul { list-style-type: square; }

  .rich-text-preview ol, .content-body ol { padding-left: 24px; list-style-type: decimal; margin-bottom: 8px; }
  .rich-text-preview ol ol, .content-body ol ol { list-style-type: lower-alpha; margin-top: 4px; }
  .rich-text-preview ol ol ol, .content-body ol ol ol { list-style-type: lower-roman; }

  .rich-text-preview ul ol, .content-body ul ol { list-style-type: decimal; margin-top: 4px; }
  .rich-text-preview ol ul, .content-body ol ul { list-style-type: disc; margin-top: 4px; }

  .text-right { text-align: right !important; }
  .text-center { text-align: center !important; }
  .text-justify { text-align: justify !important; }
`;

interface BuildLetterContentHtmlParams {
  codigoFormato: string;
  fecha: string;
  cuerpoFormateado: string;
  directorNombre?: string;
  directorCargo?: string;
}

export function buildLetterContentHtml({
  codigoFormato,
  fecha,
  cuerpoFormateado,
  directorNombre,
  directorCargo,
}: BuildLetterContentHtmlParams): string {
  return `
    <p><strong>DEU-GSU / ${codigoFormato || "FORMATO OFICIAL"}</strong></p>
    <p class="text-right">${fecha}</p>
    <p>&nbsp;</p>
    ${cuerpoFormateado}
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <div class="firma-wrap" style="page-break-inside: avoid; break-inside: avoid-page;">
      <p>Atentamente,</p>
      <div style="height: 70px;">&nbsp;</div>
      <div style="width: 300px; margin: 0 auto; text-align: center;">
        <div style="border-top: 1.5px solid black; padding-top: 5px;">
          <strong>${directorNombre || ""}</strong><br/>
          <span style="font-size: 10pt; font-weight: bold;">${directorCargo || ""}</span>
        </div>
      </div>
    </div>
  `;
}
