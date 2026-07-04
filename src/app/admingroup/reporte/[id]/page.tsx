// app/admingroup/reporte/[id+]/page.tsx
import { Metadata } from "next";
import ReporteClientPage from "@/components/formularios/reporte-form";
import { mockActivityItems } from "@/data/actividadesMock";

export const metadata: Metadata = {
  title: "Reporte de Actividad de Extensión | GSU",
  description: "Reporte con la información completa de la Actividad de Extensión.",
};

export default function ReportePage({ params }: { params: { id: string[] } }) {
  const activityId = params.id[0]; // Solo tomamos el primer id

  // Encontrar la actividad mockeada
  const activity = mockActivityItems.find((a) => String(a.id) === activityId);

  return (
    <ReporteClientPage
      activity={activity ?? null}
    />
  );
}
