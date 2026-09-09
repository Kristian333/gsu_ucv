// app/admingroup/validar-grupo/page.tsx
import { Metadata } from "next";
import ValidarGrupoForm from "@/components/formularios/validar-grupo-form";

export const metadata: Metadata = {
  title: "Validar Información del Grupo de Extensión | GSU",
  description: "Valida y renueva la información del Grupo de Extensión.",
};

export default function ValidarGrupoPage() {
  return <ValidarGrupoForm />;
}
