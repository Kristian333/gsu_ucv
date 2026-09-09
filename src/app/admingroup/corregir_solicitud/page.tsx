import { Metadata } from "next";
import CrearGrupoForm from "@/components/formularios/crear-grupo-form";

export const metadata: Metadata = {
  title: "Corregir Solicitud de Nuevo Grupo de Extensión | GSU",
  description: "Corregir la solicitud de creación de grupo de extensión universitaria.",
};

export default function CorregirGrupoPage() {
  return <CrearGrupoForm />;
}
