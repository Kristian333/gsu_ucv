// app/admingroup/solicitudes/page.tsx
import SolicitudesList from "@/components/ui/solicitudes";

export default function ValidarGrupoPage() {

  // ❗ El nombre del usuario se obtiene dentro del CLIENT COMPONENT.
  // Aquí lo que haremos es simplemente pasar TODA la data,
  // y que el componente se encargue de filtrar usando useAuth().

  return (
    <SolicitudesList />
  );
}
