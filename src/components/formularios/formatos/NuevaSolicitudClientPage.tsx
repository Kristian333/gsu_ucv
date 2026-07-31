"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Flex, VStack, HStack, Heading, Select, FormControl, FormLabel,
  Button, Card, CardBody, Text, useToast, useDisclosure,
  List, ListItem, Badge, Divider,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from "@chakra-ui/react";
import { 
  HelpCircle, Eye, Send, RotateCcw, Info, FileText, LayoutTemplate
} from "lucide-react";

import TemplatePreviewModal from "@/components/ui/TemplatePreviewModal";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";

interface NuevaSolicitudClientPageProps {
  initialTemplates: any[];
  generalData: any;
  groupId?: string;
}

export default function NuevaSolicitudClientPage({ 
  initialTemplates, 
  generalData
}: NuevaSolicitudClientPageProps) {
  const router = useRouter();
  const { user, token } = useAuth();

  const [templates] = useState(initialTemplates);
  const [selectedId, setSelectedId] = useState<string>("");

  // Datos del formato seleccionado
  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const [notas, setNotas] = useState("");
  const [modeloCarta, setModeloCarta] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const previewDisclosure = useDisclosure();
  const guideDisclosure = useDisclosure();

  const activeGroupId = user?.groupId || user?.group || "";

  // Al seleccionar una plantilla del selector, cargamos los datos
  useEffect(() => {
    if (!selectedId) {
      setTipoSolicitud("");
      setNotas("");
      setModeloCarta("");
      return;
    }

    const current = templates.find(t => String(t.id) === selectedId);
    if (current) {
      setTipoSolicitud(current.tipo_solicitud || "");
      setNotas(current.notas || "");
      setModeloCarta(current.modelo_carta || "");
    }
  }, [selectedId, templates]);

  const handleEditorChange = (content: string) => {
    setModeloCarta(content);
  };

  const handleSelectorChange = (id: string) => {
    setSelectedId(id);
  };

  const handleCancel = () => {
    const current = templates.find(t => String(t.id) === selectedId);
    if (current) {
      setModeloCarta(current.modelo_carta || "");
    }
    toast({ 
      title: "Cambios descartados", 
      description: "El formato se ha restaurado a su versión original.",
      status: "info", 
      duration: 2500 
    });
  };

  // Enviar la solicitud tras validar la presencia de {{variables}}
  const handleSubmit = async () => {
    if (!selectedId || !modeloCarta) return;

    // 1. Detección de variables no rellenadas
    const pendingVariablesMatch = modeloCarta.match(/\{\{.*?\}\}/g);

    if (pendingVariablesMatch && pendingVariablesMatch.length > 0) {
      // Extraemos nombres únicos sin duplicados para feedback claro
      const uniqueVars = Array.from(new Set(pendingVariablesMatch));
      
      toast({
        title: "Campos pendientes por completar",
        description: `Debe rellenar todas las variables delimitadas por {{...}} antes de enviar. Faltan: ${uniqueVars.slice(0, 3).join(", ")}${uniqueVars.length > 3 ? "..." : ""}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/group-resource-requests", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          grupo_id: activeGroupId,
          tipo: tipoSolicitud,
          contenido: modeloCarta,
        }),
      });

      toast({
        title: "Solicitud enviada con éxito",
        description: "Su solicitud ha sido enviada a un administrador para su revisión.",
        status: "success",
        duration: 4000,
      });

      router.push("/admingroup/solicitudes");
    } catch (error: any) {
      toast({
        title: "Error al registrar la solicitud",
        description: error?.message || "Ocurrió un fallo al comunicarse con el servidor.",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedTemplates = [...templates].sort((a, b) => a.tipo_solicitud.localeCompare(b.tipo_solicitud));

  return (
    <Box w="100%" p={0}>
      {/* TÍTULO Y BOTÓN DE GUÍA */}
      <Flex justify="space-between" align="center" mb={6} w="100%">
        <Heading size="lg" color="gray.800" fontWeight="extrabold">
          Nueva Solicitud de Recursos
        </Heading>

        <Button 
          leftIcon={<HelpCircle size={16} />} 
          colorScheme="secondary"
          bg="secondary.500"
          color="white"
          _hover={{ bg: "secondary.600" }}
          shadow="sm"
          size="sm" 
          onClick={guideDisclosure.onOpen}
        >
          Guía de Variables
        </Button>
      </Flex>

      {/* CONTENEDOR PRINCIPAL */}
      <Box 
        w="100%" 
        bg="gray.100" 
        p={6} 
        borderRadius="2xl" 
        shadow="md" 
        border="1px solid" 
        borderColor="gray.200"
      >
        <VStack spacing={6} align="stretch" w="100%">

          {/* CABECERA: SELECTOR DE FORMATO */}
          <Box bg="white" p={6} borderRadius="xl" shadow="sm">
            <FormControl>
              <FormLabel fontWeight="bold" fontSize="sm" color="gray.700" mb={2}>
                Seleccionar Formato
              </FormLabel>
              <Select 
                value={selectedId} 
                placeholder="Seleccione el formato a redactar..."
                onChange={(e) => handleSelectorChange(e.target.value)}
                size="lg"
                borderRadius="lg"
                bg="gray.50"
                borderColor="gray.300"
                _hover={{ borderColor: "secondary.400" }}
                _focus={{ borderColor: "secondary.500", bg: "white" }}
              >
                {sortedTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.tipo_solicitud}</option>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* ESTADO VACÍO: MUESTRA INDICACIÓN SI NO HAY FORMATO SELECCIONADO */}
          {!selectedId && (
            <Box bg="white" p={12} borderRadius="xl" shadow="sm" textAlign="center">
              <VStack spacing={3} align="center">
                <Box p={4} bg="gray.50" borderRadius="full" color="gray.400">
                  <LayoutTemplate size={40} />
                </Box>
                <Heading size="sm" color="gray.600">
                  Ningún formato seleccionado
                </Heading>
                <Text fontSize="sm" color="gray.500" maxW="md">
                  Por favor, seleccione un formato en la lista superior para cargar la plantilla de edición y sus instrucciones.
                </Text>
              </VStack>
            </Box>
          )}

          {/* CONTENIDO EDITABLE: SOLO VISIBLE SI HAY UN FORMATO SELECCIONADO */}
          {selectedId && (
            <Box bg="white" p={6} borderRadius="xl" shadow="sm">
              <VStack spacing={6} align="stretch">
                
                {/* EDITOR ENRIQUECIDO */}
                <FormControl>
                  <FormLabel fontWeight="bold" fontSize="sm" color="gray.700" mb={2}>
                    Redacción y Personalización de la Carta
                  </FormLabel>
                  <RichTextEditor 
                    value={modeloCarta}
                    onChange={handleEditorChange}
                    minHeight="380px"
                  />
                </FormControl>

                {/* INSTRUCCIONES Y NOTAS UBICADAS DEBAJO DEL EDITOR */}
                <Box 
                  p={4} 
                  bg="secondary.50" 
                  borderRadius="xl" 
                  borderLeft="4px solid" 
                  borderColor="secondary.400"
                >
                  <HStack spacing={2} mb={1} color="secondary.800">
                    <Info size={16} />
                    <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                      Instrucciones y Notas del Formato
                  </Text>
                  </HStack>
                  <Text fontSize="sm" color="blue.950" whiteSpace="pre-wrap" lineHeight="relaxed">
                    {notas.trim() ? notas : "Este formato no contiene observaciones adicionales."}
                  </Text>
                </Box>

                {/* BOTONES DE ACCIÓN */}
                <Flex justify="space-between" align="center" borderTop="1px solid" borderColor="gray.100" pt={4}>
                  <Button 
                    leftIcon={<Eye size={16} />} 
                    colorScheme="secondary"
                    onClick={previewDisclosure.onOpen}
                  >
                    Ver Previsualización
                  </Button>

                  <HStack spacing={3}>
                    <Button 
                      leftIcon={<RotateCcw size={16} />} 
                      variant="ghost" 
                      color="gray.600" 
                      isDisabled={isSubmitting} 
                      onClick={handleCancel}
                    >
                      Restaurar Original
                    </Button>
                    
                    <Button 
                      leftIcon={<Send size={16} />} 
                      colorScheme="primary"
                      isLoading={isSubmitting}
                      onClick={handleSubmit}
                    >
                      Enviar Solicitud
                    </Button>
                  </HStack>
                </Flex>

              </VStack>
            </Box>
          )}

        </VStack>
      </Box>

      {/* MODAL: GUÍA DE VARIABLES */}
      <AlertDialog isOpen={guideDisclosure.isOpen} leastDestructiveRef={undefined as any} onClose={guideDisclosure.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Guía Sintáctica de Variables Dinámicas</AlertDialogHeader>
            <AlertDialogBody>
              <Text fontSize="sm" mb={3}>Para completar la carta correctamente, asegúrese de reemplazar todos los campos entre llaves:</Text>
              <List spacing={3} fontSize="sm" mb={4}>
                <ListItem>
                  <Badge colorScheme="teal">{"{{campo_simple}}"}</Badge> Reemplace la variable y las llaves con su dato. Ej: reemplazar <code>{"{{nombre_coordinador}}"}</code> por el nombre real.
                </ListItem>
                <ListItem>
                  <Badge colorScheme="orange">{"{{opcion1/opcion2}}"}</Badge> Elija la opción de género/terminación adecuada.
                </ListItem>
              </List>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button colorScheme="secondary" bg="secondary.500" color="white" onClick={guideDisclosure.onClose}>Entendido</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* MODAL: PREVIEW */}
      <TemplatePreviewModal 
        isOpen={previewDisclosure.isOpen} 
        onClose={previewDisclosure.onClose} 
        tipoSolicitud={tipoSolicitud}
        modeloCarta={modeloCarta}
        generalData={generalData}
      />
    </Box>
  );
}