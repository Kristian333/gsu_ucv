"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

export const LoginForm = ({ users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Obtenemos la función login del contexto
  const { login } = useAuth(); 
  
  // Obtenemos el enrutador para redirigir
  const router = useRouter(); 

  const handleLogin = (e) => {
    e.preventDefault();

    const found = users.find(
        (u) => u.correo === email && u.contraseña === password
    );

    if (!found) {
        alert("Correo o contraseña incorrectos.");
        return;
    }

    login(found);

    // Redirección según el rol
    if (found.role === "Admin") {
        router.push("/admin/dashboard");
    } else if (found.role === "Invitado" || found.role === "Grupo") {
        router.push("/admingroup/dashboard");
    } else {
        // Por si acaso
        router.push("/");
    }
  };


  const formBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");

  return (
    <Box
      bg={formBgColor}
      p={8}
      rounded="lg"
      shadow="md"
      w="full"
      maxW="sm"
      mx="500px"
    >
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        Iniciar Sesión
      </Heading>
      <form onSubmit={handleLogin}>
        <Stack spacing={4}>
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              borderColor={inputBorderColor}
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              borderColor={inputBorderColor}
            />
          </FormControl>
          <Button type="submit" colorScheme="green" size="lg" w="full" mt={4}>
            Acceder
          </Button>
        </Stack>
      </form>
      <Text mt={6} textAlign="center" fontSize="sm" color="gray.600">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" color="teal.500" fontWeight="bold">
          Crea tu perfil ahora
        </Link>
      </Text>
    </Box>
  );
};
