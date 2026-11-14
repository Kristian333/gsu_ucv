// /app/recuperar-contrasena/page.tsx
import React from "react";
import { Metadata } from "next";
import { Flex, Box } from "@chakra-ui/react";
import { RecuperarContrasenaForm } from "@/components/formularios/recuperar-contrasena-form";

export const metadata: Metadata = {
  title: "Recuperar Contraseña | GSU",
  description: "Solicita un enlace para restablecer tu contraseña.",
};

export default function RecuperarContrasenaPage() {
  return (
    <Flex
      justifyContent="center" alignItems="center" minH="100vh"
      backgroundImage="/Aula-Magna.jpg" backgroundRepeat="no-repeat"
      backgroundSize="cover" position="relative"
    >
      {/* Capa de desenfoque de fondo */}
      <Box
        position="absolute" top={0} left={0} width="100%" height="100%"
        backdropFilter="blur(6px)" bg="rgba(0, 0, 0, 0.25)" zIndex={1}
      />

      <RecuperarContrasenaForm />
    </Flex>
  );
}
