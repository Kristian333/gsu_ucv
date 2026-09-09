import { Metadata } from "next";
import GroupRequestReviewClient from "@/components/ui/group-request-client";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Revisión de Solicitud #${params.id} | Panel Admin`,
    description: `Detalles y gestión de aprobación para la solicitud de grupo ID ${params.id}.`,
  };
}

export default function GroupRequestReviewPage({ params }: PageProps) {
  return <GroupRequestReviewClient requestId={params.id} />;
}