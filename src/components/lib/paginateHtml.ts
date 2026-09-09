// lib/paginateHtml.ts

import { CONTENT_WIDTH_MM, CONTENT_HEIGHT_MM, LETTER_CONTENT_CSS } from "./pdfLayout";

const PX_PER_MM = 96 / 25.4;

function getAttrsString(el: HTMLElement): string {
  return Array.from(el.attributes)
    .map((a) => ` ${a.name}="${a.value}"`)
    .join("");
}

function wrapTableHeaderRows(root: HTMLElement) {
  root.querySelectorAll("table").forEach((table) => {
    if (table.querySelector("thead")) return;
    const firstRow = table.querySelector("tr");
    if (firstRow && firstRow.querySelector("th")) {
      const thead = document.createElement("thead");
      thead.appendChild(firstRow);
      table.insertBefore(thead, table.firstChild);
    }
  });
}

export function wrapTableHeaderRowsInHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const container = document.createElement("div");
  container.innerHTML = html;
  wrapTableHeaderRows(container);
  return container.innerHTML;
}

type Block =
  | { type: "block"; html: string; height: number }
  | {
      type: "table";
      tableOpenTag: string;
      tableHeadHtml: string;
      tableHeadHeight: number;
      rows: { html: string; height: number }[];
    };

export function paginateHtml(html: string): string[] {
  if (typeof document === "undefined") return [html];
  if (!html || !html.trim()) return [""];

  const measureHost = document.createElement("div");
  measureHost.style.position = "fixed";
  measureHost.style.visibility = "hidden";
  measureHost.style.pointerEvents = "none";
  measureHost.style.top = "0";
  measureHost.style.left = "-99999px";
  measureHost.style.width = `${CONTENT_WIDTH_MM}mm`;
  measureHost.style.fontSize = "11pt";
  measureHost.style.lineHeight = "1.6";
  measureHost.style.textAlign = "justify";
  measureHost.className = "rich-text-preview";
  measureHost.innerHTML = html;

  const styleTag = document.createElement("style");
  styleTag.textContent = LETTER_CONTENT_CSS;
  measureHost.appendChild(styleTag);

  document.body.appendChild(measureHost);
  wrapTableHeaderRows(measureHost);

  const blocks: Block[] = [];

  Array.from(measureHost.children).forEach((node) => {
    const el = node as HTMLElement;
    if (el.tagName === "STYLE") return;

    if (el.tagName === "TABLE") {
      const thead = el.querySelector("thead");
      const tbodyOrSelf = el.querySelector("tbody") || el;
      const rows = Array.from(tbodyOrSelf.querySelectorAll(":scope > tr"));
      blocks.push({
        type: "table",
        tableOpenTag: `<table${getAttrsString(el)}>`,
        tableHeadHtml: thead ? thead.outerHTML : "",
        tableHeadHeight: thead ? thead.getBoundingClientRect().height : 0,
        rows: rows.map((r) => ({
          html: (r as HTMLElement).outerHTML,
          height: (r as HTMLElement).getBoundingClientRect().height,
        })),
      });
    } else {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      blocks.push({
        type: "block",
        html: el.outerHTML,
        height: rect.height + marginTop + marginBottom,
      });
    }
  });

  document.body.removeChild(measureHost);

  const budgetPx = CONTENT_HEIGHT_MM * PX_PER_MM;
  const pages: string[] = [];
  let currentHtml = "";
  let currentHeight = 0;

  const pushPage = () => {
    pages.push(currentHtml);
    currentHtml = "";
    currentHeight = 0;
  };

  for (const block of blocks) {
    if (block.type === "block") {
      const wouldOverflow = currentHeight + block.height > budgetPx;
      if (currentHeight > 0 && wouldOverflow) {
        pushPage();
      }
      currentHtml += block.html;
      currentHeight += block.height;
      continue;
    }

    let tableBuffer = "";
    let tableHeight = 0;

    const openTable = () => {
      tableBuffer = `${block.tableOpenTag}${block.tableHeadHtml}<tbody>`;
      tableHeight = block.tableHeadHeight;
    };
    const closeAndFlush = () => {
      tableBuffer += "</tbody></table>";
      currentHtml += tableBuffer;
      currentHeight += tableHeight;
      tableBuffer = "";
      tableHeight = 0;
    };

    openTable();

    for (const row of block.rows) {
      const wouldOverflow = currentHeight + tableHeight + row.height > budgetPx;
      const somethingAlreadyPlaced = currentHeight > 0 || tableHeight > block.tableHeadHeight;
      if (wouldOverflow && somethingAlreadyPlaced) {
        closeAndFlush();
        pushPage();
        openTable();
      }
      tableBuffer += row.html;
      tableHeight += row.height;
    }
    closeAndFlush();
  }

  if (currentHtml) pages.push(currentHtml);
  return pages.length ? pages : [""];
}
