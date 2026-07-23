import { Metadata } from "next";
import FormatosClientPage from "./FormatosClientPage";
import { getTemplates } from "./actions";

export const metadata: Metadata = {
  title: "Gestión de Formatos y Plantillas | GSU",
  description: "Panel de administración para la edición y creación de modelos de cartas oficiales de la DEU UCV.",
};

export default async function AdminFormatosPage() {
  const templates = await getTemplates();

  // Data complementaria mockeada para la previsualización del Word
  const mockGeneralData = {
    director: {
      director_extension: "Prof. Trino Alcides Díaz",
      director_genero: "Masculino"
    },
    pie_pagina: "Av. Principal de Los Chaguaramos, Ciudad Universitaria de Caracas, Edif. Sede DEU.",
    info: "Teléfono: (0212) 605-0000 | Correo: deu.ucv@gmail.com"
  };

  return (
    <FormatosClientPage 
      initialTemplates={templates} 
      generalData={mockGeneralData}
    />
  );
}