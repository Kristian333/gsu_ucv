// app/adminfacultad/page.tsx

import { mockGroupItems } from "@/data/gruposMock";
import TablaGruposFacultad from "@/components/ui/TablaGruposFacultad";

export default function AdminFacultadPage() {
  const faculty = "ciencias";

  const gruposFacultad = mockGroupItems.filter(
    (g) => g.faculty?.toLowerCase() === faculty
  );

  return <TablaGruposFacultad grupos={gruposFacultad} faculty={faculty} />;
}
