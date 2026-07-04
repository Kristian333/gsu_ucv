// app/admingroup/solicitudes/page.tsx
import { Metadata } from "next";
import SolicitudesList from "@/components/ui/solicitudes";

export const metadata: Metadata = {
  title: "Solicitudes de Recursos | GSU",
  description: "Solicitudes de Recursos hechas por el Grupo de Extensión.",
};

export default function ValidarGrupoPage() {

  // ❗ El nombre del usuario se obtiene dentro del CLIENT COMPONENT.
  // Aquí lo que haremos es simplemente pasar TODA la data,
  // y que el componente se encargue de filtrar usando useAuth().

  return (
    <SolicitudesList />
  );
}
