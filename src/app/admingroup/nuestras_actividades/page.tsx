import { Metadata } from "next";
import VistaNuestrasActividadesForm from "@/components/formularios/nuestras-actividades-form";

export const metadata: Metadata = {
  title: "Actividades del Grupo de Extensión | GSU",
  description: "Lista completa de las actividades del Grupo de Extensión.",
};

export default function NuestrasActividadesPage() {
  return <VistaNuestrasActividadesForm />;
}