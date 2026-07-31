"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  Spinner,
  VStack,
  HStack,
  Card,
  CardBody,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft, Calendar, FileText, ShieldAlert, Building2 } from "lucide-react";

import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";

interface GroupResourceRequest {
  id: string;
  grupo_id: string;
  tipo: string;
  contenido: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

interface SolicitudDetalleClientPageProps {
  requestId: string;
}

// Mapeo visual para el estado de la solicitud
const STATUS_MAP: Record<string, { label: string; colorScheme: string }> = {
  under_review: { label: "En Revisión", colorScheme: "yellow" },
  approved: { label: "Aprobada", colorScheme: "green" },
  rejected: { label: "Rechazada", colorScheme: "red" },
};

export default function SolicitudDetalleClientPage({
  requestId,
}: SolicitudDetalleClientPageProps) {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const toast = useToast();

  const [solicitud, setSolicitud] = useState<GroupResourceRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const userGroupId = user?.groupId || user?.group || "";

  useEffect(() => {
    // Esperar a que la autenticación haya terminado de cargar
    if (authLoading) return;

    // Si no hay token ni usuario, redirigir
    if (!token || !user) {
      router.push("/admingroup/solicitudes");
      return;
    }

    const fetchSolicitud = async () => {
      setIsLoading(true);
      try {
        const data: GroupResourceRequest = await apiRequest(
          `/admin/group-resource-requests/${requestId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Mapear campos si Go retorna anotaciones JSON en snake_case
        const mappedData: GroupResourceRequest = {
          id: data.id,
          grupo_id: (data as any).grupo_id || (data as any).GroupID || data.grupo_id,
          tipo: (data as any).tipo || (data as any).Type || data.tipo,
          contenido: (data as any).contenido || (data as any).Content || data.contenido,
          estado: (data as any).estado || (data as any).Status || data.estado,
          created_at: (data as any).created_at || (data as any).CreatedAt || data.created_at,
          updated_at: (data as any).updated_at || (data as any).UpdatedAt || data.updated_at,
        };

        // VALIDACIÓN DE SEGURIDAD:
        // Si la solicitud no pertenece al grupo del usuario autenticado, denegar acceso.
        if (mappedData.grupo_id && String(mappedData.grupo_id) !== String(userGroupId)) {
          toast({
            title: "Acceso denegado",
            description: "Esta solicitud pertenece a otro grupo.",
            status: "error",
            duration: 3500,
            isClosable: true,
          });
          router.push("/admingroup/solicitudes");
          return;
        }

        setSolicitud(mappedData);
      } catch (error: any) {
        toast({
          title: "Error al cargar la solicitud",
          description: error?.message || "No se pudo obtener el detalle de la solicitud.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        router.push("/admingroup/solicitudes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitud();
  }, [requestId, token, user, userGroupId, authLoading, router, toast]);

  // Spinner mientras se valida sesión o se consumen los datos
  if (authLoading || isLoading) {
    return (
      <Flex minH="60vh" align="center" justify="center" w="100%">
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.500" thickness="4px" />
          <Text color="gray.600" fontSize="sm" fontWeight="medium">
            Cargando información de la solicitud...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!solicitud) return null;

  const currentStatus = STATUS_MAP[solicitud.estado] || {
    label: solicitud.estado,
    colorScheme: "gray",
  };

  return (
    <Box w="100%" p={0}>
      {/* CABECERA */}
      <Flex justify="space-between" align="center" mb={6} w="100%" flexWrap="wrap" gap={4}>
        <HStack spacing={3}>
          <Button
            leftIcon={<ArrowLeft size={16} />}
            variant="ghost"
            color="gray.600"
            onClick={() => router.push("/admingroup/solicitudes")}
          >
            Volver
          </Button>
          <Heading size="lg" color="gray.800" fontWeight="extrabold">
            Solicitud #{solicitud.id}
          </Heading>
        </HStack>

        <Badge
          colorScheme={currentStatus.colorScheme}
          fontSize="sm"
          px={3}
          py={1.5}
          borderRadius="full"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {currentStatus.label}
        </Badge>
      </Flex>

      {/* CONTENEDOR PRINCIPAL */}
      <Card
        w="100%"
        bg="white"
        shadow="md"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
      >
        <CardBody p={6}>
          <VStack spacing={6} align="stretch">
            
            {/* METADATOS DE LA SOLICITUD */}
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              p={4}
              bg="gray.50"
              borderRadius="xl"
              gap={4}
            >
              <HStack spacing={3}>
                <FileText size={20} className="text-gray-500" />
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                    Tipo de Solicitud
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="gray.800">
                    {solicitud.tipo}
                  </Text>
                </Box>
              </HStack>

              {solicitud.created_at && (
                <HStack spacing={3}>
                  <Calendar size={20} className="text-gray-500" />
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                      Fecha de Creación
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      {new Date(solicitud.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </Box>
                </HStack>
              )}

              <HStack spacing={3}>
                <Building2 size={20} className="text-gray-500" />
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                    ID de Grupo
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    {solicitud.grupo_id}
                  </Text>
                </Box>
              </HStack>
            </Flex>

            <Divider />

            {/* CONTENIDO DE LA SOLICITUD (DOCUMENTO) */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider" mb={3}>
                Contenido / Carta Presentada
              </Text>
              
              <Box
                p={6}
                bg="gray.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                minH="250px"
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: solicitud.contenido || "<p>Sin contenido registrado.</p>" }}
              />
            </Box>

          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}