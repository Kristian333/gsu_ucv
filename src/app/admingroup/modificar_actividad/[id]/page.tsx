import { notFound } from "next/navigation";
import { mockActivityItems } from "@/data/actividadesMock";
import ModificarActividadForm from "@/components/formularios/modificar-actividad-form";

export default function ModificarActividadPage({ params }) {
  const actividad = mockActivityItems.find(
    (a) => String(a.id) === String(params.id)
  );

  if (!actividad) return notFound();

  return <ModificarActividadForm actividad={actividad} />;
}
