"use client";
import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Stack, Heading, useToast } from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usuario: email.trim(), password }),
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        login(data.user);
        toast({ title: "Acceso exitoso", status: "success" });
        router.push(data.user?.role === "Admin" ? "/admin/dashboard" : "/admingroup/dashboard");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8} rounded="lg" shadow="xl" maxW="sm" mx="auto" mt={20} bg="white">
      <Heading size="md" textAlign="center" mb={6}>Gestión Social</Heading>
      <form onSubmit={handleLogin}>
        <Stack spacing={4}>
          <FormControl id="email">
            <FormLabel>Usuario / Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Contraseña</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </FormControl>
          <Button type="submit" colorScheme="green" w="full" isLoading={isLoading}>Entrar</Button>
        </Stack>
      </form>
    </Box>
  );
};