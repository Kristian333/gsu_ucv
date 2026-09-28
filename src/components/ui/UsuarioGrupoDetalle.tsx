// components/ui/UsuarioGrupoDetalle.tsx

"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  SimpleGrid,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Icon,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Button,
} from "@chakra-ui/react";
import { FiLock, FiRefreshCw, FiUserCheck, FiInfo } from "react-icons/fi";
import { PrimaryButton, SecondaryButton } from "./buttons";
import { UserDetailBackend } from "@/types/user";
// import { apiRequest } from "@/components/formularios/api";

export default function UsuarioGrupoDetalle({ usuario }: { usuario: UserDetailBackend | null }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  /* Lógica de regeneración de contraseña (Deshabilitada temporalmente hasta que haya endpoint)

  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const handleRegeneratePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) return;

    setIsRegenerating(true);

    try {
      // 1. Confirmar contraseña del administrador y solicitar regeneración al backend
      const response = await apiRequest(`/users/${usuario?.id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({
          admin_password: adminPasswordInput,
        }),
      });

      if (response && response.new_password) {
        setGeneratedPassword(response.new_password);
        setAdminPasswordInput("");
        onClose();

        toast({
          title: "Contraseña regenerada exitosamente",
          description: "La nueva contraseña ha sido asignada a este usuario.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
      } else {
        throw new Error(response?.message || "No se pudo regenerar la contraseña.");
      }
    } catch (error: any) {
      toast({
        title: "Error al regenerar contraseña",
        description: error.message || "Verifica tu contraseña de administrador e intenta de nuevo.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setIsRegenerating(false);
    }
  }; */

  if (!usuario) {
    return (
      <Box p={10} textAlign="center">
        <Heading size="lg">Usuario no encontrado</Heading>
        <Text mt={4} color="gray.500">
          No se pudo recuperar la información del propietario de este grupo.
        </Text>
      </Box>
    );
  }

  // Verificación de existencia de datos para la sección de Información
  const hasExtraInfo = Boolean(
    (usuario.fecha_de_nacimiento && usuario.fecha_de_nacimiento.trim() !== "") ||
    (usuario.genero && usuario.genero.trim() !== "") ||
    (usuario.nivel_educativo && usuario.nivel_educativo.trim() !== "") ||
    (usuario.direccion && usuario.direccion.trim() !== "")
  );

  const formatEducativeLevel = (level?: string) => {
    if (!level) return "—";
    return level.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Sección Credenciales */}
      <Box>
        <HStack spacing={3} mb={4} align="center">
          <Icon as={FiUserCheck} boxSize={6} color="primary" />
          <Heading size="md">Credenciales</Heading>
        </HStack>

        <Box bg="gray.50" p={6} borderRadius="lg" borderWidth="1px">
          <VStack align="start" spacing={5}>
            <Box>
              <Text fontSize="md" fontWeight="bold" textTransform="uppercase" mb={1}>
                Identificación de la Cuenta
              </Text>
              <Text fontSize="md" color="gray.800">
                {usuario.nombres} {usuario.apellidos} ({usuario.email})
              </Text>
            </Box>

            <Divider />

            <Box w="full">
              {/*
              <Text fontSize="md" fontWeight="bold" textTransform="uppercase" mb={2}>
                Contraseña de la Cuenta
              </Text>
              */}

              {/* Botón de Regenerar Contraseña (Comentado para activación futura) */}
              {/*
              <VStack align="start" spacing={3}>
                <Button
                  leftIcon={<FiRefreshCw />}
                  colorScheme="teal"
                  onClick={onOpen}
                  size="md"
                >
                  Regenerar Contraseña
                </Button>

                {generatedPassword && (
                  <Box p={3} bg="green.50" border="1px solid" borderColor="green.200" borderRadius="md" w="full" maxW="400px">
                    <Text fontSize="xs" color="green.800" fontWeight="bold">
                      NUEVA CONTRASEÑA GENERADA:
                    </Text>
                    <Text fontSize="lg" fontFamily="monospace" color="green.900" fontWeight="bold" mt={1}>
                      {generatedPassword}
                    </Text>
                  </Box>
                )}
              </VStack>
              */}
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Sección Información */}
      {hasExtraInfo && (
        <>
          <Divider />
          <Box>
            <HStack spacing={3} mb={4} align="center">
              <Icon as={FiInfo} boxSize={6} color="primary" />
              <Heading size="md">Información Personal</Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {usuario.fecha_de_nacimiento && (
                <Box bg="gray.50" p={4} borderRadius="lg">
                  <Text fontSize="md" fontWeight="bold">
                    Fecha de Nacimiento
                  </Text>
                  <Text fontSize="md" mt={1}>
                    {new Date(usuario.fecha_de_nacimiento).toLocaleDateString()}
                  </Text>
                </Box>
              )}

              {usuario.genero && (
                <Box bg="gray.50" p={4} borderRadius="lg">
                  <Text fontSize="md" fontWeight="bold">
                    Género
                  </Text>
                  <Text fontSize="md" mt={1} textTransform="capitalize">
                    {usuario.genero}
                  </Text>
                </Box>
              )}

              {usuario.nivel_educativo && (
                <Box bg="gray.50" p={4} borderRadius="lg">
                  <Text fontSize="md" fontWeight="bold">
                    Nivel Educativo
                  </Text>
                  <Text fontSize="md" mt={1}>
                    {formatEducativeLevel(usuario.nivel_educativo)}
                  </Text>
                </Box>
              )}

              {usuario.direccion && (
                <Box bg="gray.50" p={4} borderRadius="lg">
                  <Text fontSize="md" fontWeight="bold">
                    Dirección
                  </Text>
                  <Text fontSize="md" mt={1}>
                    {usuario.direccion}
                  </Text>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        </>
      )}

      {/* Modal flotante de autenticación para regenerar contraseña */}
      {/*
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent as="form" onSubmit={handleRegeneratePassword}>
          <ModalHeader display="flex" alignItems="center" gap={2}>
            <Icon as={FiLock} color="primary" />
            Confirmar Identidad
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={4}>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Ingresa la contraseña de tu cuenta para autorizar la regeneración de credenciales para esta cuenta de grupo.
            </Text>
            <Input
              type="password"
              placeholder="Tu contraseña de administrador"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              focusBorderColor="primary"
              required
              autoFocus
            />
          </ModalBody>

          <ModalFooter gap={3}>
            <SecondaryButton variant="ghost" onClick={onClose} size="sm">
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" size="sm" isLoading={isRegenerating}>
              Confirmar y Regenerar
            </PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
      */}
    </VStack>
  );
}