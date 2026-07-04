// /app/admingroup/nuestras_actividades/page.tsx
import { Box, Heading } from "@chakra-ui/react";
import { Metadata } from "next";
import { mockActivityItems } from "@/data/actividadesMock";
import TablaNuestrasActividades from "@/components/ui/tabla-nuestras-actividades";

export const metadata: Metadata = {
  title: "Actividades del Grupo de Extensión | GSU",
  description: "Lista completa de las actividades del Grupo de Extensión.",
};

export default function NuestrasActividadesPage() {
    
    const actividades = mockActivityItems;

    return  (
        <Box maxW="container.xl" mx="auto" py={10} px={6}>
            <Heading mb={6}>Nuestras Actividades — LAMUN</Heading>
    
            <TablaNuestrasActividades actividades={actividades} />
        </Box>
    )
}
