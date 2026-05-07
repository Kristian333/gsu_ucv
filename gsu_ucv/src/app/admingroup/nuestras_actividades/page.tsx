// /app/admingroup/nuestras_actividades/page.tsx
import { Box, Heading } from "@chakra-ui/react";
import { mockActivityItems } from "@/data/actividadesMock";
import TablaNuestrasActividades from "@/components/ui/tabla-nuestras-actividades";

export default function NuestrasActividadesPage() {
    
    const actividades = mockActivityItems;

    return  (
        <Box maxW="container.xl" mx="auto" py={10} px={6}>
            <Heading mb={6}>Nuestras Actividades — LAMUN</Heading>
    
            <TablaNuestrasActividades actividades={actividades} />
        </Box>
    )
}
