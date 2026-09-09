// app/admingroup/solicitudes/page.tsx
import { Metadata } from "next";
import SolicitudesList from "@/components/ui/solicitudes-grupo";

export const metadata: Metadata = {
  title: "Solicitudes de Recursos | GSU",
  description: "Solicitudes de Recursos hechas por el Grupo de Extensión.",
};

export default function MisSolicitudesRecursosPage() {
  return <SolicitudesList />;
}
