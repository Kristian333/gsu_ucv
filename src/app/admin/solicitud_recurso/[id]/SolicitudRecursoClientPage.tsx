"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, VStack, HStack, Heading, FormControl, FormLabel,
  Button, Text, useToast, useDisclosure, IconButton, Select, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Spinner, Code
} from "@chakra-ui/react";
import { 
   FileText, Eye, CheckCircle, XCircle, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import TemplatePreviewModal, { PreviewModalMode } from "@/components/ui/TemplatePreviewModal";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface SolicitudRecursoClientPageProps {
  requestId: string;
  generalData: any;
}

export default function SolicitudRecursoClientPage({ requestId, generalData }: SolicitudRecursoClientPageProps) {
  const router = useRouter();
  const { isHydrated, token } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [solicitud, setSolicitud] = useState<any>(null);
  const [contenido, setContenido] = useState<string>("");
  const [, setIsDirty] = useState(false);

  // Selección de firmante de la DEU
  const [selectedMemberId, setSelectedMemberId] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<PreviewModalMode>("preview_previa_s_r");

  const previewDisclosure = useDisclosure();
  const templateModalDisclosure = useDisclosure();

  // Cargar datos de la BD
  const fetchSolicitud = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`/admin/group-resource-requests/${requestId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSolicitud(result);
      if (result.contenido) {
        setContenido(result.contenido);
        setTimeout(() => setIsDirty(false), 50);
      }
    } catch (error) {
      toast({
        title: "Error al cargar la solicitud",
        description: "No se pudieron obtener los detalles desde el servidor.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [requestId, toast, token]);

  useEffect(() => {
    if (isHydrated) {
      fetchSolicitud();
    }
  }, [isHydrated, fetchSolicitud]);

  const handleEditorChange = (newContent: string) => {
    setContenido(newContent);
    setIsDirty(true);
  };

  // Obtener datos del firmante DEU
  const deuOrganoObj = generalData?.UCV?.find(
    (u: any) => u.organo === "DEU" || u.key === "DEU" || u.organo?.includes("Dirección de Extensión")
  ) || generalData?.UCV?.[0];

  const deuMembers = deuOrganoObj?.miembros || [];

  const getSelectedFirmanteData = () => {
    const miembroObj = deuMembers.find((m: any) => m.id_m === Number(selectedMemberId)) || deuMembers[0];

    return {
      info: generalData?.info,
      pie_pagina: generalData?.pie_pagina,
      director: {
        director_extension: miembroObj?.nombre || "Sin Asignar",
        cargo: miembroObj?.cargo || "Autoridad Universitaria",
      }
    };
  };

  // Prepara el modal en modo "approve"
  const handleOpenApproveModal = () => {
    setPreviewMode("approve");
    previewDisclosure.onOpen();
  };

  // Aprobación de solicitud
  const handleConfirmApprove = async () => {
    setSubmitting(true);
    try {
      await apiRequest(`/admin/group-resource-requests/${requestId}/approve`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      toast({
        title: "Solicitud Aprobada",
        description: "La solicitud ha sido aprobada correctamente.",
        status: "success",
      });

    // Actualizar estado local inmediatamente para cambiar la UI y ocultar botones
    setSolicitud((prev: any) => prev ? { ...prev, estado: "approved" } : prev);

      await fetchSolicitud();
    } catch (error: any) {
      toast({
        title: "Error al aprobar",
        description: error.message || "Ocurrió un error al procesar la aprobación.",
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Rechazo de solicitud
  const handleReject = async () => {
    setSubmitting(true);
    try {
      await apiRequest(`/admin/group-resource-requests/${requestId}/reject`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      toast({
        title: "Solicitud Rechazada",
        description: "La solicitud ha sido rechazada.",
        status: "info",
      });

    // Actualizar estado local inmediatamente
    setSolicitud((prev: any) => prev ? { ...prev, estado: "rejected" } : prev);

      await fetchSolicitud();
    } catch (error: any) {
      toast({
        title: "Error al rechazar",
        description: error.message || "Ocurrió un error al procesar el rechazo.",
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Abre el modal en modo previsualización simple
  const handleOpenPreviewSimple = () => {
    setPreviewMode("preview_previa_s_r");
    previewDisclosure.onOpen();
  };

  // Estados
  const getBadgeStyle = (estado: string) => {
    const statusKey = estado?.toLowerCase();
    switch (statusKey) {
      case 'approved':
      case 'aprobada':
        return { bg: "#D1FAE5", color: "#059669", border: "#10B981", label: "Aprobada" };
      case 'rejected':
      case 'rechazada':
        return { bg: "#FEE2E2", color: "#DC2626", border: "#EF4444", label: "Rechazada" };
      case 'under_review':
      case 'pendiente':
      default:
        return { bg: "#FEF3C7", color: "#D97706", border: "#F59E0B", label: "En Revisión" };
    }
  };

  // Búsqueda de la plantilla original basada en el tipo de solicitud
  const getOriginalTemplate = () => {
    if (!solicitud?.tipo || !generalData?.plantillas) return null;
    return generalData.plantillas.find(
      (p: any) => p.tipo?.toLowerCase().trim() === solicitud.tipo?.toLowerCase().trim()
    );
  };

  const originalTemplate = getOriginalTemplate();

  if (loading || !isHydrated) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="primary" />
      </Flex>
    );
  }

  const badgeStyle = getBadgeStyle(solicitud?.estado);
  const isUnderReview = solicitud?.estado?.toLowerCase() === "under_review";

  return (
    <Box p={6} bg="gray.100" minH="100vh">
      {/* NAVEGACIÓN Y CABECERA SUPERIORES */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <HStack spacing={4}>
          <IconButton 
            aria-label="Volver" 
            icon={<ArrowLeft size={18} />} 
            onClick={() => router.back()} 
            variant="ghost" 
          />
          <VStack align="flex-start" spacing={0}>
            <HStack spacing={3}>
              <Heading size="md" color="blue.900">
                Solicitud: {solicitud?.tipo || "Sin Categoría"}
              </Heading>
              <Box 
                px={3} py={1} 
                borderRadius="full" 
                fontSize="xs" 
                fontWeight="bold"
                bg={badgeStyle.bg}
                color={badgeStyle.color}
                border="1px solid"
                borderColor={badgeStyle.border}
              >
                {badgeStyle.label}
              </Box>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              Grupo: <strong>{solicitud?.grupo_nombre || `#${solicitud?.grupo_id}`}</strong> | Solicitud ID: #{solicitud?.id}
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={3}>
          <Button 
            leftIcon={<FileText size={16} />} 
            bg="secondary" 
            color="white" 
            _hover={{ filter: "brightness(0.9)" }}
            size="sm" 
            onClick={templateModalDisclosure.onOpen}
          >
            Plantilla Original
          </Button>
        </HStack>
      </Flex>

      {/* PANEL DE SELECCIÓN DE FIRMANTE */}
      <Box bg="white" p={4} borderRadius="xl" shadow="sm" mb={6}>
        <Heading size="xs" textTransform="uppercase" color="gray.500" mb={3}>
          Configuración de Firmante Oficial de la DEU
        </Heading>
        <Flex gap={4} wrap="wrap">
          <FormControl maxW="400px">
            <FormLabel fontSize="xs">Autoridad Firmante</FormLabel>
            <Select 
              size="sm" 
              value={selectedMemberId} 
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
            >
              {deuMembers.map((m: any) => (
                <option key={m.id_m} value={m.id_m}>
                  {m.nombre} - {m.cargo}
                </option>
              ))}
            </Select>
          </FormControl>
        </Flex>
      </Box>

      {/* EDITOR DE CONTENIDO Y CARTA DE LA SOLICITUD */}
      <Box bg="white" p={6} borderRadius="xl" shadow="md" mb={6}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontWeight="bold">Contenido de la Solicitud / Documentación Presentada</FormLabel>
            <RichTextEditor 
              value={contenido}
              onChange={handleEditorChange}
              minHeight="300px"
            />
          </FormControl>
        </VStack>
      </Box>

      {/* BARRA DE ACCIONES INFERIOR */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Button 
          leftIcon={<Eye size={16} />} 
          bg="secondary" 
          color="white" 
          _hover={{ filter: "brightness(0.9)" }} 
          onClick={handleOpenPreviewSimple}
        >
          Ver Previsualización de Carta
        </Button>

        {isUnderReview && (
          <HStack spacing={3}>
            <Button 
              leftIcon={<XCircle size={16} />} 
              bg="danger" 
              color="white"
              _hover={{ filter: "brightness(0.9)" }} 
              isLoading={submitting}
              onClick={handleReject}
            >
              Rechazar
            </Button>
            <Button 
              leftIcon={<CheckCircle size={16} />} 
              bg="primary" 
              color="white"
              _hover={{ filter: "brightness(0.9)" }} 
              isLoading={submitting}
              onClick={handleOpenApproveModal}
            >
              Aprobar
            </Button>
          </HStack>
        )}
      </Flex>

      {/* MODAL CON LA PLANTILLA ORIGINAL */}
      <Modal isOpen={templateModalDisclosure.isOpen} onClose={templateModalDisclosure.onClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader color="blue.900">Plantilla Original / Formato</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {originalTemplate ? (
              <VStack align="stretch" spacing={4}>
                {originalTemplate.nota && (
                  <Box p={3} bg="amber.50" border="1px solid" borderColor="amber.200" borderRadius="md">
                    <Text fontSize="xs" fontWeight="bold" color="amber.800" mb={1}>
                      Nota del formato:
                    </Text>
                    <Text fontSize="xs" color="amber.900">
                      {originalTemplate.nota}
                    </Text>
                  </Box>
                )}
                <Box border="1px solid" borderColor="gray.200" p={4} borderRadius="md" bg="gray.50">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                    Cuerpo del Formato:
                  </Text>
                  <Code display="block" whiteSpace="pre-wrap" p={3} fontSize="xs" borderRadius="md" bg="white">
                    {originalTemplate.formato || originalTemplate.contenido}
                  </Code>
                </Box>
              </VStack>
            ) : (
              <Flex justify="center" align="center" py={8}>
                <Text color="gray.500" fontWeight="bold">Formato no encontrado</Text>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button bg="secondary" color="white" _hover={{ filter: "brightness(0.9)" }} onClick={templateModalDisclosure.onClose} size="sm">
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* PREVIEW MODAL CARTA */}
      <TemplatePreviewModal 
        isOpen={previewDisclosure.isOpen} 
        onClose={previewDisclosure.onClose} 
        tipoSolicitud={solicitud?.tipo || "Solicitud de Recurso"}
        modeloCarta={contenido}
        generalData={getSelectedFirmanteData()}
        mode={previewMode}
        onConfirmApprove={handleConfirmApprove}
      />
    </Box>
  );
}