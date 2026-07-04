// app/admin/usuarios/[id]/page.tsx

import { mockGroupItems } from "@/data/gruposMock";
import GrupoDetalle from "@/components/ui/GrupoDetalle";

export default function GrupoAdminDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const grupo = mockGroupItems.find((g) => g.id === params.id) || null;

  return <GrupoDetalle grupo={grupo} />;
}
