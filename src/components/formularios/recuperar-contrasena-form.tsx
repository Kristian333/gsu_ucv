"use client";

import React, { useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { apiRequest } from "@/components/formularios/api";
import { getPasswordErrorMessage } from "@/utils/errorMapper";

export function RecuperarContrasenaForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      // El backend responde lo mismo exista o no la cuenta.
      const data = await apiRequest("auth/password/forgot", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage(data?.mensaje || "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
    } catch (err: any) {
      setError(getPasswordErrorMessage(err?.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      zIndex={2} p={10} maxWidth="450px" width="90%" bg="white"
      borderRadius="xl" boxShadow="2xl" textAlign="center"
    >
      <VStack spacing={6}>
        <Heading size="xl" color="gray.800" mb={2}>Recuperar contraseña</Heading>

        {message ? (
          <Alert status="success" rounded="md" textAlign="left">
            <AlertIcon />
            {message}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack spacing={6}>
              <Text color="gray.500">
                Escribe el correo con el que inicias sesión y te enviaremos un enlace para crear una nueva contraseña.
              </Text>

              {error && (
                <Alert status="error" rounded="md" textAlign="left">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel fontWeight="medium" color="gray.600">Correo electrónico</FormLabel>
                <Input
                  type="email" placeholder="tu.correo@ejemplo.com" variant="outline" focusBorderColor="primary.500"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit" bg="primary.500" color="white" _hover={{ bg: "primary.600" }}
                width="full" size="lg" isLoading={isLoading} loadingText="Enviando..."
              >
                Enviar enlace
              </Button>
            </VStack>
          </form>
        )}

        <Text color="gray.500" fontSize="sm">
          <Link as={NextLink} href="/login" color="secondary.500" fontWeight="bold">Volver a iniciar sesión</Link>
        </Text>
      </VStack>
    </Box>
  );
}
