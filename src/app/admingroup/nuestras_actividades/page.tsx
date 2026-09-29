import { Metadata } from "next";
import VistaNuestrasActividadesForm from "@/components/formularios/nuestras-actividades-form";

export const metadata: Metadata = {
  title: "Actividades del Grupo de Extensión | GSU",
  description: "Lista completa de las actividades del Grupo de Extensión.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NuestrasActividadesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  return <VistaNuestrasActividadesForm searchParams={resolvedSearchParams} />;
}