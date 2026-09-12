// /components/formularios/login-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  VStack, Input, Button, FormControl, FormLabel, 
  Heading, useToast, Box, Text, Link 
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuth, AuthUser } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { getDashboardRouteByRoles } from "@/utils/redirectByRole";
import { getFacultyImagePath } from "@/utils/common";

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

      const token = data.token;
      const facultad = data.facultad || "";
      const groupId = data.grupoId || "";
      const groupName = data.nombreGrupo || "";
      const infoUsuario = data.usuario;

      if (!infoUsuario) {
        throw new Error("No se recibieron datos del perfil del usuario.");
      }

      if (token) localStorage.setItem("token", token);
      if (facultad) localStorage.setItem("facultad", facultad);
      if (groupId) localStorage.setItem("group_id", groupId);

      const roles = (infoUsuario.roles || []).map((r: string) => r.toLowerCase().trim());
      const esAdminGlobal = roles.includes("root") || roles.includes("deu_admin");
      const esGrupo = roles.includes("group_admin") || roles.includes("group_helper");
      const esFacultad = roles.includes("faculty_admin");

      let userAvatar = infoUsuario.avatar || "";

      // Asignación de avatar según rol:
      if (esAdminGlobal) {
        userAvatar = "/logo.png";
      } else if (esFacultad) {
        userAvatar = getFacultyImagePath(facultad || infoUsuario.facultad);
      }

      let groupActive: boolean | undefined = undefined;
      let groupUpdatedAt: string | undefined = undefined;

      if (esGrupo && groupId) {
        try {
          const groupDetail = await apiRequest(`groups/${groupId}`, {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (groupDetail) {
            groupActive = groupDetail.activo;
            groupUpdatedAt = groupDetail.actualizado_en;

            // Si el grupo tiene logo personalizado, se utiliza como avatar
            if (groupDetail.imagen_url) {
              userAvatar = groupDetail.imagen_url;
            }
          }
        } catch (errGroup) {
          console.error("No se pudieron cargar los detalles adicionales del grupo:", errGroup);
        }
      }

      const usuarioCompleto: AuthUser = {
        id: String(infoUsuario.id),
        name: infoUsuario.nombre || infoUsuario.name || "",
        correo: infoUsuario.correo || "",
        avatar: userAvatar,
        roles: infoUsuario.roles || [],
        groupId: groupId,
        group: groupName,
        groupActive: groupActive,
        groupUpdatedAt: groupUpdatedAt,
        facultad: facultad,
      };

      login(usuarioCompleto, token);

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