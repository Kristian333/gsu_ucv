import { Metadata } from "next";
import EstadisticasGrupo from "@/components/formularios/graficas-grupos";

export const metadata: Metadata = {
  title: "Estadísticas del Grupo de Extensión | GSU",
  description: "Visualizar las estadísticas del grupo de extensión universitaria.",
};

export default function EstadisticasGrupoPage() {
  return <EstadisticasGrupo />;
}