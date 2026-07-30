// /components/formularios/login-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  VStack, Input, Button, FormControl, FormLabel, 
  Heading, useToast, Box, Text, Link 
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { getDashboardRouteByRoles } from "@/utils/redirectByRole";

interface GroupBackendItem {
  id: any;
  propietario?: { id: any };
}

export function LoginForm() {
  const [nombreUsuario, setNombreUsuario] = useState(""); 
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => { 
    if (user && user.roles) {
      const targetRoute = getDashboardRouteByRoles(user.roles);
      router.replace(targetRoute);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await apiRequest("auth/login", {
        method: "POST",
        body: JSON.stringify({ usuario: nombreUsuario, password: password }),
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      const infoUsuario = data.usuario;
      if (!infoUsuario) {
        throw new Error("No se recibieron datos del perfil del usuario.");
      }

      const roles = (infoUsuario.roles || []).map((r: string) => r.toLowerCase().trim());
      const esGrupo = roles.includes("group_admin") || roles.includes("group_helper");

      const usuarioCompleto = {
        id: String(infoUsuario.id),
        name: infoUsuario.nombre || infoUsuario.name || "",
        correo: infoUsuario.correo || "",
        avatar: infoUsuario.avatar || "",
        roles: infoUsuario.roles || [],
        groupId: "" 
      };

      // Resolución inmediata si maneja roles de grupo operativo
      if (esGrupo) {
        try {
          const dataGrupos = await apiRequest("groups?per_page=100", { method: "GET" });
          const lista: GroupBackendItem[] = dataGrupos.grupos || [];
          
          const miGrupoAsociado = lista.find(g => 
            g.propietario && String(g.propietario.id).trim() === String(infoUsuario.id).trim()
          );

          if (miGrupoAsociado) {
            const idEncontrado = String(miGrupoAsociado.id);
            localStorage.setItem("group_id", idEncontrado);
            usuarioCompleto.groupId = idEncontrado; 
          }
        } catch (errGroup) {
          console.error("No se pudo pre-cargar el ID del grupo en el login:", errGroup);
        }
      }

      login(usuarioCompleto);

      toast({ title: "¡Bienvenido!", status: "success", duration: 2000 });

      const targetRoute = getDashboardRouteByRoles(infoUsuario.roles || []);
      window.location.href = targetRoute;

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

  // Si ya hay un usuario logueado, podemos evitar renderizar el formulario mientras redirige
  if (user) {
    return null; 
  }

  return (
    <Box 
      zIndex={2} p={10} maxWidth="450px" width="90%" bg="white" 
      borderRadius="xl" boxShadow="2xl" textAlign="center"
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <Heading size="xl" color="gray.800" mb={2}>Iniciar Sesión</Heading>
          
          <FormControl isRequired>
            <FormLabel fontWeight="medium" color="gray.600">Usuario</FormLabel>
            <Input 
              type="text" placeholder="Tu usuario" variant="outline" focusBorderColor="green.500"
              value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} 
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="medium" color="gray.600">Contraseña</FormLabel>
            <Input 
              type="password" placeholder="••••••••" variant="outline" focusBorderColor="green.500"
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />
          </FormControl>

          <Button 
            type="submit" bg="#38A169" color="white" _hover={{ bg: "#2F855A" }}
            width="full" size="lg" fontSize="xl" py={7} isLoading={isLoading}
            loadingText="Verificando..." boxShadow="0 4px 12px rgba(66, 153, 225, 0.3)"
          >
            Acceder
          </Button>

          <Text color="gray.500" fontSize="sm">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" color="blue.500" fontWeight="bold">Crea tu perfil ahora</Link>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}