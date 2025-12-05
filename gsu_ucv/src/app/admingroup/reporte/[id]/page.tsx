// app/admingroup/reporte/[id+]/page.tsx
import ReporteClientPage from "@/components/formularios/reporte-form";
import { mockActivityItems } from "@/data/actividadesMock";

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
