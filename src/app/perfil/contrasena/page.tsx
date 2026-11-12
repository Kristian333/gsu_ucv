// /app/perfil/contrasena/page.tsx
import React from "react";
import { Metadata } from "next";
import { Box } from "@chakra-ui/react";
import { CambiarContrasenaForm } from "@/components/formularios/cambiar-contrasena-form";

export const metadata: Metadata = {
  title: "Cambiar Contraseña | GSU",
  description: "Cambia la contraseña de tu cuenta.",
};

export default function CambiarContrasenaPage() {
  return (
    <Box minH="100vh" bg="gray.50" px={4} py={{ base: 8, md: 12 }}>
      <CambiarContrasenaForm />
    </Box>
  );
}
