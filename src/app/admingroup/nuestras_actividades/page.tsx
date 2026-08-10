import { Metadata } from "next";
import VistaNuestrasActividadesForm from "@/components/formularios/nuestras-actividades-form";

export const metadata: Metadata = {
  title: "Actividades del Grupo de Extensión | GSU",
  description: "Lista completa de las actividades del Grupo de Extensión.",
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function NuestrasActividadesPage({ searchParams }: PageProps) {
  return <VistaNuestrasActividadesForm searchParams={searchParams} />;
}