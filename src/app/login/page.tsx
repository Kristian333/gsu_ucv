// /app/login/page.tsx
import React from "react";
import { Metadata } from "next";
import { Flex, Box } from "@chakra-ui/react";
import { LoginForm } from "@/components/formularios/login-form";

export const metadata: Metadata = {
  title: "Inicio de Sesión | GSU",
  description: "Inicia sesión en nuestro portal web.",
};

export default function LoginPage() {
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

      <LoginForm />
    </Flex>
  );
}