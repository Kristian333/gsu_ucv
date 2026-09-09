import { Metadata } from "next";
import SolicitudDetalleClientPage from "@/components/ui/SolicitudDetalleClientPage";

export const metadata: Metadata = {
  title: "Detalle de Solicitud | Admin Group",
  description: "Visualización detallada de la solicitud de recursos",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function SolicitudDetallePage({ params }: PageProps) {
  return <SolicitudDetalleClientPage requestId={params.id} />;
}