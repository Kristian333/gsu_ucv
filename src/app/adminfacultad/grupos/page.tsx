// app/adminfacultad/page.tsx
import { Metadata } from "next";
import { AdminFacultadContent } from "@/components/ui/AdminFacultadContent";

interface AdminFacultadPageProps {
  searchParams: { 
    page?: string;
    q?: string;
    active?: string;
  };
}

export const metadata: Metadata = {
  title: "Grupos de Extensión de esta Facultad | GSU",
  description: "Lista de Grupos de Extensión asociados a esta Facultad.",
};

export default function AdminFacultadPage({ searchParams }: AdminFacultadPageProps) {
  return <AdminFacultadContent searchParams={searchParams} />;
}
