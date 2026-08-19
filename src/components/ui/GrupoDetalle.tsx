// components/ui/GrupoDetalle.tsx

"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Divider,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Center,
  Icon,
} from "@chakra-ui/react";
import { FiFileText, FiEye } from "react-icons/fi";
import { GroupDetailBackend, GroupMember, Award } from "@/types/group";
import { formatListToString } from "@/utils/common";

export default function GrupoDetalle({ grupo }: { grupo: GroupDetailBackend | null }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocUrl, setSelectedDocUrl] = useState<string>("");
  const [selectedDocName, setSelectedDocName] = useState<string>("");
  const facultyDisplay = formatListToString(grupo.facultad);

  if (!grupo) {
    return (
      <Box p={10} textAlign="center">
        <Heading size="lg">Grupo no encontrado</Heading>
        <Text mt={4} color="gray.500">
          El grupo solicitado no existe o no se pudo obtener la información.
        </Text>
      </Box>
    );
  }

  const hasAwards = Array.isArray(grupo.reconocimientos) && grupo.reconocimientos.length > 0;
  const hasMembers = Array.isArray(grupo.miembros) && grupo.miembros.length > 0;

  const handleOpenDocument = (member: GroupMember) => {
    const fileUrl = member.documento.startsWith("http")
      ? member.documento
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/files/documents/${member.documento}`;

    setSelectedDocUrl(fileUrl);
    setSelectedDocName(`Documento de ${member.nombre}`);
    onOpen();
  };

  const isPdf = selectedDocUrl.toLowerCase().endsWith(".pdf");

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack spacing={6} align="center">
        <Image
          src={grupo.imagen_url || "/imagen-no-disponible.jpg"}
          alt={grupo.nombre}
          boxSize="140px"
          objectFit="cover"
          borderRadius="xl"
          shadow="sm"
          fallbackSrc="/imagen-no-disponible.jpg"
        />

        <Box flex="1">
          <HStack align="center" spacing={3}>
            <Heading size="xl">{grupo.nombre}</Heading>
            <Badge colorScheme={grupo.activo ? "green" : "red"}>
              {grupo.activo ? "Activo" : "Inactivo"}
            </Badge>
          </HStack>
          <Text color="gray.500" mt={1} fontSize="md">
            Fundación: {new Date(grupo.fundacion).toLocaleDateString()}
          </Text>
        </Box>
      </HStack>

      <Divider />

      {/* Información Básica */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box bg="gray.50" p={5} borderRadius="lg">
          <Heading size="md" mb={2} color="gray.700">Objetivo</Heading>
          <Text color="gray.600" fontSize="md">{grupo.objetivo}</Text>
        </Box>

        <VStack align="start" spacing={3} bg="gray.50" p={5} borderRadius="lg">
          <Text fontSize="md"><strong>Email:</strong> {grupo.email || "—"}</Text>
          <Text fontSize="md"><strong>Teléfono:</strong> {grupo.telefono || "—"}</Text>
          <Text fontSize="md"><strong>Facultad:</strong> {facultyDisplay || "—"}</Text>
          <Text fontSize="md"><strong>Área:</strong> {grupo.tipo || "—"}</Text>
        </VStack>
      </SimpleGrid>

      {/* Reconocimientos */}
      {hasAwards && (
        <>
        <Divider />

        {/* Premios */}
        <Box>
          <Heading size="md" mb={4}>Reconocimientos</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {(grupo.reconocimientos as Award[]).map((award, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="gray.50"
                >
                  <Text fontWeight="bold">{award.awardName}</Text>
                  <Badge mt={2} colorScheme="secondary">
                    {award.awarddate}
                  </Badge>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </>
      )}

      <Divider />

      {/* Miembros del Grupo */}
      <Box>
        <Heading size="md" mb={4}>
          Miembros del Grupo ({grupo.miembros?.length || 0})
        </Heading>

        {hasMembers ? (
          <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="xs">Nombre</Th>
                  <Th fontSize="xs">Cédula</Th>
                  <Th fontSize="xs">Contacto</Th>
                  <Th fontSize="xs">Coordinación</Th>
                  <Th fontSize="xs">Año</Th>
                  <Th fontSize="xs">Escuela / Facultad</Th>
                  <Th fontSize="xs" textAlign="center">Documento</Th>
                </Tr>
              </Thead>
              <Tbody>
                {grupo.miembros.map((miembro) => (
                  <Tr key={miembro.id}>
                    <Td fontWeight="medium" fontSize="sm">{miembro.nombre}</Td>
                    <Td fontSize="sm">{miembro.cedula}</Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm">{miembro.correo}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {miembro.telefono}
                        </Text>
                      </VStack>
                    </Td>
                    <Td fontSize="sm">{miembro.coordinacion}</Td>
                    <Td fontSize="sm">{miembro.año}</Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{miembro.escuela}</Text>
                        <Badge fontSize="0.75em" colorScheme="secondary">
                          {miembro.facultad}
                        </Badge>
                      </VStack>
                    </Td>
                    <Td textAlign="center">
                      <Button
                        size="sm"
                        colorScheme="primary"
                        onClick={() => handleOpenDocument(miembro)}
                      >
                        Ver Documento
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Text color="gray.500">No hay miembros registrados en este grupo.</Text>
        )}
      </Box>

      {/* Modal flotante para Visualización de Documentos */}
      <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent h="85vh">
          <ModalHeader fontSize="md" display="flex" alignItems="center" gap={2}>
            <Icon as={FiFileText} color="primary.500" />
            {selectedDocName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={2} bg="gray.100">
            {selectedDocUrl ? (
              isPdf ? (
                <iframe
                  src={selectedDocUrl}
                  width="100%"
                  height="100%"
                  style={{ border: "none", borderRadius: "8px" }}
                  title="Documento PDF"
                />
              ) : (
                <Center h="100%">
                  <Image
                    src={selectedDocUrl}
                    alt="Documento Adjunto"
                    maxH="100%"
                    objectFit="contain"
                    borderRadius="md"
                  />
                </Center>
              )
            ) : (
              <Center h="100%">
                <Text color="gray.500">No se pudo cargar la previsualización.</Text>
              </Center>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
