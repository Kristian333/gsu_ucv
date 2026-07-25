import { Metadata } from "next";
import ModificarActividadForm from "@/components/formularios/modificar-actividad-form";

export const metadata: Metadata = {
  title: "Modificar Actividad | GSU",
  description: "Formulario para la edición y actualización de actividades de extensión.",
};

interface PaginaProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function PaginaModificarActividad({ params }: PaginaProps) {
  const resolvedParams = await params;
  const idActividad = resolvedParams.id;

  return <ModificarActividadForm id={idActividad} />;
}
