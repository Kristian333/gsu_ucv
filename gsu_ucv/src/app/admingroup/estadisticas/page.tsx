// /app/admingroup/estadisticas/page.tsx
import { mockActivityItems } from "@/data/actividadesMock";


export default function EstadisticasPage() {
  const grupoActual = "lamun";

  const actividadesGrupo = mockActivityItems.filter(
    (a) => a.group.toLowerCase() === grupoActual
  );

  
}

