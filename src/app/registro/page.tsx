import React from 'react';
import { Metadata } from "next";
import { Flex, Box } from "@chakra-ui/react";
import { RegisterForm } from "@/components/formularios/registro-form";

export const metadata: Metadata = {
  title: "Registro de Usuario | GSU",
  description: "Registro de usuario en nuestro portal web.",
};

export default function RegisterPage() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      backgroundImage="/Aula-Magna.jpg"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        backdropFilter="blur(6px)"     
        bg="rgba(0, 0, 0, 0.25)"
        zIndex={1}
      />
      <Box zIndex={2}>
        <RegisterForm />
      </Box>
    </Flex>
  );
}