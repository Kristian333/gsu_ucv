// app/admingroup/validar-grupo/page.tsx
import ValidarGrupoForm from "@/components/formularios/validar-grupo-form";
import { mockGroupItems } from "@/data/gruposMock";

export default function ValidarGrupoPage() {

  // ❗ El nombre del usuario se obtiene dentro del CLIENT COMPONENT.
  // Aquí lo que haremos es simplemente pasar TODA la data,
  // y que el componente se encargue de filtrar usando useAuth().

  return (
    <ValidarGrupoForm groups={mockGroupItems} />
  );
}
