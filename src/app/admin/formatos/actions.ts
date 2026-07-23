"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const filePath = path.join(process.cwd(), "src/data/templates.json");

export async function getTemplates() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error leyendo plantillas:", error);
    return [];
  }
}

export async function saveTemplates(templates: any[]) {
  try {
    await fs.writeFile(filePath, JSON.stringify(templates, null, 2), "utf-8");
    revalidatePath("/admin/formatos");
    return { success: true };
  } catch (error) {
    console.error("Error guardando plantillas:", error);
    return { success: false, error: "No se pudo escribir el archivo." };
  }
}