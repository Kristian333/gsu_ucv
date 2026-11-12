// /app/perfil/page.tsx
import React from "react";
import { Metadata } from "next";
import { Box } from "@chakra-ui/react";
import { EditarPerfilForm } from "@/components/formularios/editar-perfil-form";

export const metadata: Metadata = {
  title: "Mi Perfil | GSU",
  description: "Edita los datos de tu cuenta.",
};

export default function PerfilPage() {
  return (
    <Box minH="100vh" bg="gray.50" px={4} py={{ base: 8, md: 12 }}>
      <EditarPerfilForm />
    </Box>
  );
}
