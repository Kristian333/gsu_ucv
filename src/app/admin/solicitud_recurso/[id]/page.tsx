import { Metadata } from "next";
import SolicitudRecursoClientPage from "./SolicitudRecursoClientPage";
import generalDataJson from "@/data/general_data.json";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Solicitud de Recurso #${params.id} | GSU`,
    description: "Detalle y gestión de solicitud de recursos para Grupos de Extensión.",
  };
}

export default async function SolicitudRecursoPage({ params }: PageProps) {
  // Pasamos el JSON estructurado completo para que el cliente arme los selectores de firmante
  return (
    <SolicitudRecursoClientPage 
      requestId={params.id} 
      generalData={generalDataJson}
    />
  );
}