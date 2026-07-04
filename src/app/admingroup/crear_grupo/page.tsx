import { Metadata } from "next";
import CrearGrupoForm from "@/components/formularios/crear-grupo-form";

export const metadata: Metadata = {
  title: "Solicitar Nuevo Grupo de Extensión | GSU",
  description: "Formulario para la solicitud de creación de nuevos grupos de extensión universitaria.",
};

export default function CrearGrupoPage() {
  return <CrearGrupoForm />;
}
