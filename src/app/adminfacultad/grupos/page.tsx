// app/adminfacultad/page.tsx
import { Metadata } from "next";
import { mockGroupItems } from "@/data/gruposMock";
import TablaGruposFacultad from "@/components/ui/TablaGruposFacultad";

export const metadata: Metadata = {
  title: "Grupos de Extensión de esta Facultad | GSU",
  description: "Lista de Grupos de Extensión asociado a esta Facultad.",
};

export default function AdminFacultadPage() {
  const faculty = "ciencias";

  const gruposFacultad = mockGroupItems.filter(
    (g) => g.faculty?.toLowerCase() === faculty
  );

  return <TablaGruposFacultad grupos={gruposFacultad} faculty={faculty} />;
}
