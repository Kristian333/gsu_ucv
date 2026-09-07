"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  VStack,
  Heading,
  Text,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  GridItem,
  useToast,
  Divider,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { GroupRequestDetails } from "@/types/group-request";
import { GroupDetailBackend } from "@/types/group";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";
import { formatDateToClient, formatListToString } from "@/utils/common";
import ConfirmationModal from "./ConfirmationModal";

interface Props {
  requestId: string;
}

export default function GroupRequestReviewClient({ requestId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { token } = useAuth();

  const [data, setData] = useState<GroupRequestDetails | null>(null);
  const [fetching, setFetching] = useState(true);
  const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isOpen: isDocOpen, onOpen: onDocOpen, onClose: onDocClose } = useDisclosure();
  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null);
  const [activeDocTitle, setActiveDocTitle] = useState<string>("");

  const handleOpenDoc = (url: string, title: string) => {
    setActiveDocUrl(url);
    setActiveDocTitle(title);
    onDocOpen();
  };

  const fetchRequestDetails = useCallback(async () => {
    if (!token) return;

    setFetching(true);
    setErrorMsg(null);

    try {
      const requestRes = (await apiRequest(
        `/admin/group-requests/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )) as GroupRequestDetails;

      let groupDetails: GroupDetailBackend | null = null;

      if (requestRes.grupo_id) {
        try {
          groupDetails = (await apiRequest(
            `/groups/${requestRes.grupo_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )) as GroupDetailBackend;
        } catch (groupErr) {
          console.warn("No se pudo obtener el detalle del grupo:", groupErr);
        }
      }

      setData({
        ...requestRes,
        grupo_detalle: groupDetails,
      });
    } catch (err: any) {
      setErrorMsg(
        err.message || "Error al cargar los detalles de la solicitud."
      );
    } finally {
      setFetching(false);
    }
  }, [requestId, token]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleAction = async () => {
    if (!modalType || !token) return;
    setLoading(true);
    setErrorMsg(null);

    const endpoint = `/admin/group-requests/${requestId}/${modalType}`;

    try {
      await apiRequest(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalType(null);
      
      toast({
        title: `Solicitud ${modalType === "approve" ? "aprobada" : "rechazada"}`,
        status: modalType === "approve" ? "success" : "info",
        duration: 3000,
      });

      await fetchRequestDetails();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al procesar la acción.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "approved":
        return <Badge colorScheme="green" fontSize="0.8em" px={3} py={1} borderRadius="full">Aprobado</Badge>;
      case "rejected":
        return <Badge colorScheme="red" fontSize="0.8em" px={3} py={1} borderRadius="full">Rechazado</Badge>;
      case "under_review":
      default:
        return <Badge colorScheme="yellow" fontSize="0.8em" px={3} py={1} borderRadius="full">En Revisión</Badge>;
    }
  };

  if (fetching) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="secondary.500" thickness="4px" />
      </Flex>
    );
  }

  if (!data) {
    return (
      <Box maxW="1200px" mx="auto" mt={10} p={6} textAlign="center">
        <Text color="red.500" fontWeight="medium">
          {errorMsg || "No se pudo encontrar la información de la solicitud."}
        </Text>
      </Box>
    );
  }

  const grupo = data.grupo_detalle;
  const isUnderReview = data.estado?.toLowerCase() === "under_review";

  return (
    <Box maxW="1200px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <VStack spacing={8} align="stretch">
        
        {/* Encabezado */}
        <Flex justify="space-between" align="center" pb={4} borderBottom="1px solid" borderColor="gray.200">
            <Box>
                <Heading size="lg" mb={1}>
                Revisión de Solicitud de Grupo: {data.grupo_nombre}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                ID Solicitud: {data.id}
                </Text>
            </Box>
            {getStatusBadge(data.estado)}
        </Flex>

        {errorMsg && (
          <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
            <Text color="red.700" fontSize="sm">
              {errorMsg}
            </Text>
          </Box>
        )}

        {/* Comentarios de la Solicitud */}
        {data.comentarios && (
          <Box p={4} bg="secondary.50" border="1px solid" borderColor="secondary.100" borderRadius="md">
            <Text fontWeight="bold" color="secondary.900" fontSize="sm">
              Comentario del solicitante:
            </Text>
            <Text color="secondary.800" fontSize="sm" mt={1}>
              {data.comentarios}
            </Text>
          </Box>
        )}

        {/* Información General del Grupo */}
        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
          <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor="gray.200">
            Información General del Grupo
          </Heading>
          
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap={6}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} fontSize="sm" flex="1">
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Text fontWeight="bold">Nombre del Grupo</Text>
                <Text color="gray.800" fontSize="md" fontWeight="medium">{data.grupo_nombre}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Facultad Principal</Text>
                <Text color="gray.800">{data.facultad}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Tipo de Grupo</Text>
                <Text color="gray.800">{formatListToString(grupo?.tipo)}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Fecha de Fundación</Text>
                <Text color="gray.800">{formatDateToClient(grupo?.fundacion)}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Estado Activo</Text>
                <Text color="gray.800">{grupo?.activo ? "Sí" : "No"}</Text>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Text fontWeight="bold">Objetivo</Text>
                <Text color="gray.800" whiteSpace="pre-line">
                  {grupo?.objetivo || "Sin objetivo disponible"}
                </Text>
              </GridItem>
              {grupo?.proyecto_url && (
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Text fontWeight="bold" mb={1}>Documento del Proyecto</Text>
                  <Button
                    size="sm"
                    colorScheme="secondary"
                    variant="outline"
                    onClick={() => handleOpenDoc(grupo.proyecto_url!, "Proyecto del Grupo")}
                  >
                    Ver Proyecto (PDF/Imagen)
                  </Button>
                </GridItem>
              )}
            </Grid>

            {/* Logo de la agrupación alineado a la derecha */}
            {grupo?.imagen_url && (
              <Flex direction="column" align="center" justify="flex-start" minW="140px">
                <Text fontWeight="bold" fontSize="xs" color="gray.500" mb={2}>
                  Logo
                </Text>
                <Image
                  src={grupo.imagen_url}
                  alt={`Logo de ${data.grupo_nombre}`}
                  boxSize="120px"
                  objectFit="cover"
                  borderRadius="lg"
                  shadow="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  fallbackSrc="/imagen-no-disponible.jpg"
                />
              </Flex>
            )}
          </Flex>
        </Box>

        {/* Contacto */}
        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
          <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor="gray.200">
            Contacto
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} fontSize="sm">
            <GridItem>
              <Text fontWeight="bold">Correo Electrónico</Text>
              <Text color="gray.800">{grupo?.email || "N/A"}</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Teléfono</Text>
              <Text color="gray.800">{grupo?.telefono || "N/A"}</Text>
            </GridItem>
          </Grid>
        </Box>

        {/* Integrantes Registrados */}
        {grupo?.miembros && grupo.miembros.length > 0 && (
          <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor="gray.200">
              Integrantes Registrados ({grupo.miembros.length})
            </Heading>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Nombre</Th>
                    <Th>Cédula</Th>
                    <Th>Correo</Th>
                    <Th>Escuela / Facultad</Th>
                    <Th>Coordinación</Th>
                    <Th>Documento</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {grupo.miembros.map((m: any) => (
                    <Tr key={m.id || m.cedula}>
                      <Td fontWeight="medium" color="gray.800">{m.nombre}</Td>
                      <Td>{m.cedula}</Td>
                      <Td>{m.correo}</Td>
                      <Td>{`${m.escuela || ""} (${m.facultad || ""})`}</Td>
                      <Td>{m.coordinacion || "N/A"}</Td>
                      <Td>
                        {m.documento_url ? (
                          <Button
                            size="xs"
                            colorScheme="primary"
                            onClick={() =>
                              handleOpenDoc(m.documento_url, `Documento de ${m.nombre}`)
                            }
                          >
                            Ver Documento
                          </Button>
                        ) : (
                          <Text fontSize="xs" color="gray.400">Sin archivo</Text>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Historial de Aprobaciones */}
        {data.aprobaciones && data.aprobaciones.length > 0 && (
          <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor="gray.200">
              Estado de Revisiones por Facultad
            </Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
              {data.aprobaciones.map((ap) => (
                <Flex
                  key={ap.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  justify="space-between"
                  align="center"
                  fontSize="sm"
                >
                  <Box>
                    <Text fontWeight="medium" color="gray.800">{ap.facultad}</Text>
                    {ap.revisado_en && (
                      <Text fontSize="xs" color="gray.400">
                        Revisado: {formatDateToClient(ap.revisado_en)}
                      </Text>
                    )}
                  </Box>
                  {getStatusBadge(ap.estado)}
                </Flex>
              ))}
            </Grid>
          </Box>
        )}

        {/* Botones de Acción */}
        {isUnderReview && (
          <>
            <Divider />
            <Flex justify="flex-end" gap={4} pt={2}>
                <Button
                    colorScheme="red"
                    size="md"
                    onClick={() => setModalType("reject")}
                >
                    Rechazar Solicitud
                </Button>
                <Button
                    colorScheme="green"
                    size="md"
                    onClick={() => setModalType("approve")}
                >
                    Aprobar Solicitud
                </Button>
            </Flex>
          </>
        )}

        {/* Modal de Confirmación */}
        {modalType && (
          <ConfirmationModal
            isOpen={!!modalType}
            type={modalType}
            loading={loading}
            onConfirm={handleAction}
            onClose={() => setModalType(null)}
          />
        )}

        {/* Modal Flotante para Visualizar PDF / Imágenes */}
        <Modal isOpen={isDocOpen} onClose={onDocClose} size="4xl" isCentered>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(3px)" />
          <ModalContent h="80vh">
            <ModalHeader>{activeDocTitle}</ModalHeader>
            <ModalCloseButton />
            <ModalBody p={4} display="flex" justifyContent="center" alignItems="center">
              {activeDocUrl ? (
                activeDocUrl.endsWith(".pdf") ? (
                  <iframe
                    src={activeDocUrl}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                  />
                ) : (
                  <Image
                    src={activeDocUrl}
                    alt={activeDocTitle}
                    maxH="100%"
                    maxW="100%"
                    objectFit="contain"
                  />
                )
              ) : (
                <Text>No hay documento cargado.</Text>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

      </VStack>
    </Box>
  );
}