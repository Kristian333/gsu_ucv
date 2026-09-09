import { Metadata } from "next";
import EstadisticasAdmin from "@/components/formularios/grafica-admin";

export const metadata: Metadata = {
  title: "Estadísticas Globales de Administración | GSU",
  description: "Métricas consolidadas de todos los grupos de extensión universitaria.",
};

export default function EstadisticasAdminPage() {
  return <EstadisticasAdmin />;
}
