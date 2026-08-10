import { Metadata } from "next";
import SubirReporteForm from "@/components/formularios/reporte-form";

export const metadata: Metadata = {
  title: "Subir Reporte de Actividad | GSU",
  description: "Carga los resultados y evidencias fotográficas de la actividad.",
};

export default function ReporteActividadPage({ params }: { params: { id: string } }) {
  return <SubirReporteForm id={params.id} />;
}
