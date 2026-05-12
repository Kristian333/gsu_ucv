"use client";

import React, { useState, useEffect } from "react";
import { 
  VStack, 
  Input, 
  Button, 
  FormControl, 
  FormLabel, 
  Heading, 
  useToast, 
  Box, 
  Flex,
  Text,
  Link
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";

export default function LoginPage() {
  const [nombreUsuario, setNombreUsuario] = useState(""); 
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  
  useEffect(() => { 
    localStorage.clear(); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      
      const data = await apiRequest("auth/login", {
        method: "POST",
        body: JSON.stringify({ 
          usuario: nombreUsuario, 
          password: password 
        }),
      });

      
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      
      const infoUsuario = data.usuario;

      if (!infoUsuario) {
        throw new Error("No se recibieron datos del perfil del usuario.");
      }

      // 4. Guardar en el Contexto de Autenticación
      login(infoUsuario);

      
      const roles = (infoUsuario.roles || []).map((r: string) => r.toLowerCase().trim());

      toast({ 
        title: "¡Bienvenido!", 
        status: "success", 
        duration: 2000 
      });

      
      if (roles.includes("root") || roles.includes("deu_admin")) {
        router.push("/admin/dashboard");
      } 
      else if (roles.includes("faculty_admin")) {
        router.push("/adminfacultad/dashboard");
      } 
      else if (roles.includes("group_admin") || roles.includes("group_helper")) {
        
        router.push("/admingroup/dashboard");
      } 
      else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      toast({ 
        title: "Error de acceso", 
        description: error.message || "Credenciales incorrectas", 
        status: "error",
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      backgroundImage="/Aula-Magna.jpg"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      position="relative"
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

      {/* Contenedor del Formulario  */}
      <Box 
        zIndex={2} 
        p={10} 
        maxWidth="450px" 
        width="90%" 
        bg="white" 
        borderRadius="xl" 
        boxShadow="2xl"
        textAlign="center"
      >
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <Heading size="xl" color="gray.800" mb={2}>
              Iniciar Sesión
            </Heading>
            
            <FormControl isRequired>
              <FormLabel fontWeight="medium" color="gray.600">Usuario</FormLabel>
              <Input 
                type="text" 
                placeholder="Tu usuario"
                variant="outline"
                focusBorderColor="green.500"
                value={nombreUsuario} 
                onChange={(e) => setNombreUsuario(e.target.value)} 
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="medium" color="gray.600">Contraseña</FormLabel>
              <Input 
                type="password" 
                placeholder="••••••••"
                variant="outline"
                focusBorderColor="green.500"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </FormControl>

            <Button 
              type="submit" 
              bg="#38A169" 
              color="white"
              _hover={{ bg: "#2F855A" }}
              width="full" 
              size="lg"
              fontSize="xl"
              py={7}
              isLoading={isLoading}
              loadingText="Verificando..."
              boxShadow="0 4px 12px rgba(66, 153, 225, 0.3)"
            >
              Acceder
            </Button>

            <Text color="gray.500" fontSize="sm">
              ¿No tienes cuenta?{" "}
              <Link color="blue.500" fontWeight="bold">
                Crea tu perfil ahora
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}