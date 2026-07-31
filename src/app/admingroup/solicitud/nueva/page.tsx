// app/admingroup/solicitud/nueva/page.tsx
import { Metadata } from "next";
import NuevaSolicitudClientPage from "@/components/formularios/formatos/NuevaSolicitudClientPage";
import { getTemplates } from "../../../admin/formatos/actions";
import generalDataJson from "@/data/general_data.json";

export const metadata: Metadata = {
  title: "Nueva Solicitud de Recursos | GSU",
  description: "Creación y redacción de solicitudes de recursos para Grupos de Extensión.",
};

export default async function NuevaSolicitudPage() {
  const templates = await getTemplates();

  // 1. Ubicamos el órgano DEU (id_ucv: 1)
  const deuOrgan = generalDataJson.UCV.find(organo => organo.organo === "DEU");

  // 2. Buscamos a la persona de la DEU con id_m = 1 (Directora/Director)
  const directorInfo = deuOrgan?.miembros.find(m => m.id_m === 1);

  // 3. Estructuramos la data estática general
  const generalData = {
    info: generalDataJson.info,
    pie_pagina: generalDataJson.pie_pagina,
    director: {
      director_extension: directorInfo?.nombre || "Sin Asignar",
      cargo: directorInfo?.cargo || "Director/a de Extensión Universitaria",
    }
  };

  return (
    <NuevaSolicitudClientPage 
      initialTemplates={templates} 
      generalData={generalData}
    />
  );
}