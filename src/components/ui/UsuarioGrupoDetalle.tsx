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
} from "@chakra-ui/react";
import { FiLock, FiEye, FiEyeOff, FiUserCheck, FiInfo } from "react-icons/fi";
import { PrimaryButton, SecondaryButton } from "./buttons";
import { UserDetailBackend } from "@/types/user";

export default function UsuarioGrupoDetalle({ usuario }: { usuario: UserDetailBackend | null }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Estados para la revelación de la contraseña de la cuenta del grupo
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState("••••••••");

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

  const handleConfirmPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) return;

    // TODO: Conectar con el endpoint de verificación de clave del admin en el backend
    // Como fallback temporal, asignamos "nolodire"
    // Validación temporal: la contraseña debe ser "nolodire"
    if (adminPasswordInput === "nolodire") {
        setRevealedPassword("nolodire");
        setIsRevealed(true);
        setAdminPasswordInput("");
        onClose();

      toast({
        title: "Identidad confirmada, mostrando contraseña",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",containerStyle: {
          backgroundColor: "var(--chakra-colors-primary, #319795)",
          color: "white",
        },
      });
    } else {
      toast({
        title: "Contraseña incorrecta",
        description: "No tienes permisos para ver esta credencial.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  const handleToggleHide = () => {
    setIsRevealed(false);
    setRevealedPassword("••••••••");
  };

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
              <Text fontSize="md" fontWeight="bold" textTransform="uppercase" mb={2}>
                Contraseña de la Cuenta
              </Text>

              <HStack maxW="400px" spacing={3}>
                <InputGroup size="md">
                  <Input
                    type={isRevealed ? "text" : "password"}
                    value={revealedPassword}
                    readOnly
                    bg="white"
                    focusBorderColor="primary"
                    fontWeight={isRevealed ? "normal" : "normal"}
                  />
                  {isRevealed && (
                    <InputRightElement>
                      <IconButton
                        aria-label="Ocultar contraseña"
                        icon={<FiEyeOff />}
                        size="sm"
                        variant="ghost"
                        onClick={handleToggleHide}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>

                {!isRevealed && (
                  <IconButton
                    colorScheme="secondary"
                    aria-label="Revelar contraseña"
                    icon={<FiEye />}
                    size="md"
                    onClick={onOpen}
                  />
                )}
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Sección Información (Se renderiza únicamente si al menos un valor no está vacío) */}
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

      {/* Modal flotante de verificación de contraseña del Administrador */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent as="form" onSubmit={handleConfirmPassword}>
          <ModalHeader display="flex" alignItems="center" gap={2}>
            <Icon as={FiLock} color="primary" />
            Confirmar Identidad
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody py={4}>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Ingresa la contraseña de tu cuenta para revelar la clave del usuario.
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
            <PrimaryButton type="submit" size="sm">
              Enviar
            </PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}