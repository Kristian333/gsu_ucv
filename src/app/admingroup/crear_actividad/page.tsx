import { Metadata } from "next";
import CrearActividadForm from "@/components/formularios/crear-actividad-form";

export const metadata: Metadata = {
  title: "Planificar Actividad de Extensión | GSU",
  description: "Planifica una nueva actividad de extensión.",
};

export default function CrearActividadPage() {
  return <CrearActividadForm />;
}
