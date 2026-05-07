// /app/admingroup/estadisticas/page.tsx
import { mockActivityItems } from "@/data/actividadesMock";
import Estadisticas from "@/components/ui/estadisticas/Estadisticas";

export default function EstadisticasPage() {
  const grupoActual = "lamun";

  const actividadesGrupo = mockActivityItems.filter(
    (a) => a.group.toLowerCase() === grupoActual
  );

  return <Estadisticas actividades={actividadesGrupo} />;
}

