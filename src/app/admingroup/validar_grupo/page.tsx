// app/admingroup/validar-grupo/page.tsx
import { Metadata } from "next";
import ValidarGrupoForm from "@/components/formularios/validar-grupo-form";
import { mockGroupItems } from "@/data/gruposMock";

export const metadata: Metadata = {
  title: "Validar Información del Grupo de Extensión | GSU",
  description: "Valida y Renueva la información del Grupo de Extensión.",
};

export default function ValidarGrupoPage() {

  // ❗ El nombre del usuario se obtiene dentro del CLIENT COMPONENT.
  // Aquí lo que haremos es simplemente pasar TODA la data,
  // y que el componente se encargue de filtrar usando useAuth().

  return (
    <ValidarGrupoForm groups={mockGroupItems} />
  );
}
