import MiGrupoClient from "@/components/ui/MiGrupoClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Grupo | GSU",
  description: "Información detallada de mi grupo de extensión",
};

export default function MiGrupoPage() {
  return <MiGrupoClient />;
}