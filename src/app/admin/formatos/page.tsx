import { Metadata } from "next";
import FormatosClientPage from "./FormatosClientPage";
import { getTemplates } from "./actions";
import generalDataJson from "@/data/general_data.json";

export const metadata: Metadata = {
  title: "Gestión de Formatos y Plantillas | GSU",
  description: "Panel de administración para la edición y creación de modelos de cartas oficiales de la DEU UCV.",
};

export default async function AdminFormatosPage() {
  const templates = await getTemplates();

  // 1. Ubicamos el órgano DEU (id_ucv: 1)
  const deuOrgan = generalDataJson.UCV.find(organo => organo.organo === "DEU");

  // 2. Buscamos a la persona de la DEU con id_m = 1 (Directora/Director)
  const directorInfo = deuOrgan?.miembros.find(m => m.id_m === 1);

  // 3. Estructuramos la data que se le pasará al componente cliente
  const generalData = {
    info: generalDataJson.info,
    pie_pagina: generalDataJson.pie_pagina,
    director: {
      director_extension: directorInfo?.nombre || "Sin Asignar",
      cargo: directorInfo?.cargo || "Director/a de Extensión Universitaria",
    }
  };

  return (
    <FormatosClientPage 
      initialTemplates={templates} 
      generalData={generalData}
    />
  );
}