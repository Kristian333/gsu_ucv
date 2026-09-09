"use client";

import { useState, useEffect } from "react";
import {
  Box, Flex, VStack, HStack, Heading, Select, FormControl, FormLabel,
  Input, Button, Card, CardBody, Text, Textarea, useToast, useDisclosure,
  List, ListItem, Badge,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from "@chakra-ui/react";
import { 
  HelpCircle, Eye, Save, XCircle, PlusCircle, Trash2
} from "lucide-react";

import { saveTemplates } from "./actions";
import TemplatePreviewModal from "@/components/ui/TemplatePreviewModal";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface FormatosClientPageProps {
  initialTemplates: any[];
  generalData: any;
}

export default function FormatosClientPage({ initialTemplates, generalData }: FormatosClientPageProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isNew, setIsNew] = useState(false);

  // Estados de los campos mutables
  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const [notas, setNotas] = useState("");
  const [modeloCarta, setModeloCarta] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  
  // Navegación interceptada
  const [pendingSelectionId, setPendingSelectionId] = useState<string | null>(null);

  const toast = useToast();
  const previewDisclosure = useDisclosure();
  const alertDisclosure = useDisclosure();
  const guideDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();

  // Carga de datos de plantilla al seleccionar
  useEffect(() => {
    if (!selectedId || isNew) return;
    const current = templates.find(t => String(t.id) === selectedId);
    if (current) {
      setTipoSolicitud(current.tipo_solicitud);
      setNotas(current.notas || "");
      setModeloCarta(current.modelo_carta || "");
      setTimeout(() => setIsDirty(false), 50);
    }
  }, [selectedId, templates, isNew]);

  // Monitorear cambios manuales en inputs comunes
  const trackFieldChange = (setter: any, val: string) => {
    setter(val);
    setIsDirty(true);
  };

  const handleEditorChange = (content: string) => {
    setModeloCarta(content);
    setIsDirty(true);
  };

  const handleSelectorChange = (id: string) => {
    if (isDirty) {
      setPendingSelectionId(id);
      alertDisclosure.onOpen();
    } else {
      setIsNew(false);
      setSelectedId(id);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      setIsNew(false);
      // Redirigir al primero de la lista ordenada alfabéticamente si existe
      const sorted = [...templates].sort((a, b) => a.tipo_solicitud.localeCompare(b.tipo_solicitud));
      setSelectedId(sorted[0] ? String(sorted[0].id) : "");
    } else {
      const current = templates.find(t => String(t.id) === selectedId);
      if (current) {
        setTipoSolicitud(current.tipo_solicitud);
        setNotas(current.notas || "");
        setModeloCarta(current.modelo_carta || "");
      }
    }
    setIsDirty(false);
    toast({ title: "Cambios revertidos", status: "info", duration: 2000 });
  };

  const handleNewTemplate = () => {
    const triggerCreation = () => {
      setIsNew(true);
      setSelectedId("");
      setTipoSolicitud("");
      setNotas("");
      setModeloCarta("<p>Escriba aquí el cuerpo del formato institucional...</p>");
      setTimeout(() => setIsDirty(true), 50);
    };

    if (isDirty) {
      setPendingSelectionId("__NEW__");
      alertDisclosure.onOpen();
    } else {
      triggerCreation();
    }
  };

  const handleSave = async () => {
    const cuerpoCarta = modeloCarta || "";
    if (!tipoSolicitud.trim() || !cuerpoCarta.trim() || cuerpoCarta === "<p></p>") {
      toast({ title: "Error de Validación", description: "El tipo de solicitud y el cuerpo de la carta son requeridos.", status: "error" });
      return;
    }

    let updatedTemplates = [...templates];

    if (isNew) {
      const nextId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
      const nuevoObj = { id: nextId, tipo_solicitud: tipoSolicitud, modelo_carta: cuerpoCarta, notas };
      updatedTemplates.push(nuevoObj);
      setTemplates(updatedTemplates);
      setSelectedId(String(nextId));
      setIsNew(false);
    } else {
      updatedTemplates = templates.map(t => 
        String(t.id) === selectedId 
          ? { ...t, tipo_solicitud: tipoSolicitud, modelo_carta: cuerpoCarta, notas }
          : t
      );
      setTemplates(updatedTemplates);
    }

    const res = await saveTemplates(updatedTemplates);
    if (res.success) {
      setIsDirty(false);
      toast({ title: isNew ? "Formato Creado exitosamente" : "Cambios Guardados en templates.json", status: "success" });
    } else {
      toast({ title: "Error al escribir en servidor", description: res.error, status: "error" });
    }
  };

  // Confirmar eliminación del formato actual
  const handleDeleteConfirm = async () => {
    deleteDisclosure.onClose();
    
    // Filtrar para quitar la plantilla actual
    const updatedTemplates = templates.filter(t => String(t.id) !== selectedId);
    
    const res = await saveTemplates(updatedTemplates);
    if (res.success) {
      setTemplates(updatedTemplates);
      setIsDirty(false);
      toast({ title: "Formato eliminado correctamente", status: "success" });
      
      // Obtener la nueva lista ordenada alfabéticamente para redirigir al primer elemento
      const nextSorted = [...updatedTemplates].sort((a, b) => a.tipo_solicitud.localeCompare(b.tipo_solicitud));
      if (nextSorted.length > 0) {
        setSelectedId(String(nextSorted[0].id));
      } else {
        setSelectedId("");
        setTipoSolicitud("");
        setNotas("");
        setModeloCarta("");
      }
    } else {
      toast({ title: "Error al eliminar plantilla", description: res.error, status: "error" });
    }
  };

  const confirmDiscardAndNavigate = () => {
    alertDisclosure.onClose();
    setIsDirty(false);
    if (pendingSelectionId === "__NEW__") {
      setIsNew(true);
      setSelectedId("");
      setTipoSolicitud("");
      setNotas("");
      setModeloCarta("");
    } else {
      setIsNew(false);
      setSelectedId(pendingSelectionId || "");
    }
    setPendingSelectionId(null);
  };

  const sortedTemplates = [...templates].sort((a, b) => a.tipo_solicitud.localeCompare(b.tipo_solicitud));

  return (
    <Box p={6} bg="gray.200" minH="100vh">
      <Flex justify="right" align="right" mb={6}>
        <HStack spacing={3}>
          <Button leftIcon={<HelpCircle size={16} />} bg="secondary" color="white" _hover={{ filter: "brightness(0.9)" }} size="sm" onClick={guideDisclosure.onOpen}>Guía de Variables</Button>
          <Button leftIcon={<PlusCircle size={16} />} bg="primary" color="white" _hover={{ filter: "brightness(0.9)" }} size="sm" onClick={handleNewTemplate}>Crear Nuevo Formato</Button>
        </HStack>
      </Flex>

      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* PANEL IZQUIERDO DE CONTROL */}
        <VStack w={{ base: "100%", lg: "30%" }} spacing={4} align="stretch">
          <Card shadow="md">
            <CardBody>
              <FormControl>
                <FormLabel fontWeight="bold" fontSize="xs" textTransform="uppercase">Seleccionar Plantilla Activa</FormLabel>
                <Select 
                  value={isNew ? "" : selectedId} 
                  placeholder={isNew ? "[Creando nuevo formato...]" : "Seleccione un formato..."}
                  onChange={(e) => handleSelectorChange(e.target.value)}
                >
                  {sortedTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.tipo_solicitud}</option>
                  ))}
                </Select>
              </FormControl>
            </CardBody>
          </Card>

          <Card shadow="md">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="xs" color="gray.500" textTransform="uppercase">Notas de Control</Heading>
                <FormControl>
                  <FormLabel fontSize="xs">Anotaciones necesarias correspondiente al formato actual</FormLabel>
                  <Textarea 
                    fontSize="sm"
                    rows={4}
                    value={notas}
                    placeholder="Escriba aquí notas que sirvan de guía..."
                    onChange={(e) => trackFieldChange(setNotas, e.target.value)}
                  />
                </FormControl>
                {isDirty && <Badge colorScheme="orange" p={2} borderRadius="md" textAlign="center">Tiene cambios pendientes de guardado</Badge>}
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* PANEL CENTRAL: FORMULARIO Y EDITOR ENRIQUECIDO */}
        <Box flex={1} bg="white" p={6} borderRadius="xl" shadow="md">
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="bold">Tipo de Solicitud / Nombre de Plantilla</FormLabel>
              <Input 
                value={tipoSolicitud}
                placeholder="Ej. Constancia de Postulación de Becas"
                onChange={(e) => trackFieldChange(setTipoSolicitud, e.target.value)}
              />
            </FormControl>

            {/* MENÚ DE ACCIONES DEL EDITOR ENRIQUECIDO */}
            <FormControl isRequired>
              <FormLabel fontWeight="bold" mb={2}>Cuerpo del Formato (Modelo de Carta)</FormLabel>
              <RichTextEditor 
                value={modeloCarta}
                onChange={handleEditorChange}
                minHeight="280px"
              />
            </FormControl>

            <Flex justify="space-between" mt={4} borderTop="1px solid" borderColor="gray.100" pt={4}>
              <Button leftIcon={<Eye size={16} />} bg="secondary" color="white" _hover={{ filter: "brightness(0.9)" }} onClick={previewDisclosure.onOpen}>Ver Preview</Button>
              <HStack spacing={3}>
                {/* BOTÓN ELIMINAR: SÓLO APARECE SI NO ES UNA NUEVA PLANTILLA Y TIENE ID SELECCIONADA */}
                {!isNew && selectedId && (
                  <Button leftIcon={<Trash2 size={16} />} bg="danger" color="white" _hover={{ filter: "brightness(0.9)" }} onClick={deleteDisclosure.onOpen}>
                    Eliminar Formato
                  </Button>
                )}
                <Button leftIcon={<XCircle size={16} />} variant="ghost" color="gray.600" _hover={{ bg: "gray.100" }} isDisabled={!isDirty} onClick={handleCancel}>Cancelar</Button>
                <Button leftIcon={<Save size={16} />} bg="primary" color="white" _hover={{ filter: "brightness(0.9)" }} isDisabled={!isDirty} onClick={handleSave}>
                  {isNew ? "Crear Nuevo Formato" : "Guardar Cambios"}
                </Button>
              </HStack>
            </Flex>
          </VStack>
        </Box>
      </Flex>

      {/* MODAL 1: GUÍA DE VARIABLES REQUERIDAS */}
      <AlertDialog isOpen={guideDisclosure.isOpen} leastDestructiveRef={undefined as any} onClose={guideDisclosure.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Guía Sintáctica de Variables Dinámicas</AlertDialogHeader>
            <AlertDialogBody>
              <Text fontSize="sm" mb={3}>Todo elemento variable que se autocompletará en los pasos siguientes del sistema debe declararse estrictamente bajo las siguientes condiciones:</Text>
              <List spacing={3} fontSize="sm" mb={4}>
                <ListItem>
                    <Badge colorScheme="teal">{"{{campo_simple}}"}</Badge> Variables en minúscula y entre dobles llaves. Ej: <code>{"{{nombre_grupo}}"}</code>, <code>{"{{fecha_actual}}"}</code>.
                </ListItem>
                <ListItem>
                    <Badge colorScheme="orange">{"{{opcion1/opcion2}}"}</Badge> Para adaptaciones de género. Ej: <code>{"Ciudadan{{a/o}}"}</code> o <code>{"Coordinador{{a/}}"}</code>.
                </ListItem>
                <ListItem>
                    <Badge colorScheme="purple">Estilos enriquecidos</Badge> Si desea aplicar estilos (<b>Negrita</b>, <i>Itálica</i>, etc.) a una variable, debe aplicarse <b>incluyendo las llaves por completo</b>. Por ejemplo: <code><b>{"{{nombre_grupo}}"}</b></code>. Evite estilizar solo el contenido interno (como {"{"}<b>nombre_grupo</b>{"}"}) para prevenir errores en el procesador de datos.
                </ListItem>
              </List>
              <Box bg="blue.50" borderLeft="4px solid" borderColor="secondary" p={3} borderRadius="md">
                <Text fontSize="xs" fontWeight="bold" color="blue.900">Uso de Tablas Reales:</Text>
                <Text fontSize="xs" color="blue.800">Usa el botón "Tablas" de la barra de herramientas. Dentro de las celdas de datos, coloca variables simples como <code>{"{{miembro_nombre}}"}</code> o <code>{"{{miembro_cedula}}"}</code> para indicar como completar cada columna.</Text>
              </Box>
            </AlertDialogBody>
            <AlertDialogFooter><Button bg="secondary" color="white" _hover={{ filter: "brightness(0.9)" }} onClick={guideDisclosure.onClose}>Entendido</Button></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* MODAL 2: INTERCEPTOR DIRTY STATE */}
      <AlertDialog isOpen={alertDisclosure.isOpen} leastDestructiveRef={undefined as any} onClose={alertDisclosure.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Cambios no guardados</AlertDialogHeader>
            <AlertDialogBody>Hay modificaciones pendientes en la plantilla actual. Si continúa, perderá los cambios realizados. ¿Desea proceder?</AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={alertDisclosure.onClose} size="sm">Permanecer aquí</Button>
              <Button bg="danger" color="white" onClick={confirmDiscardAndNavigate} ml={3} size="sm">Descartar y continuar</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* MODAL 3: CONFIRMACIÓN DE ELIMINACIÓN */}
      <AlertDialog isOpen={deleteDisclosure.isOpen} leastDestructiveRef={undefined as any} onClose={deleteDisclosure.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">¿Eliminar este formato?</AlertDialogHeader>
            <AlertDialogBody>
              ¿Está seguro de que desea eliminar permanentemente la plantilla <strong>"{tipoSolicitud}"</strong>? Esta acción no se puede deshacer y modificará de inmediato el archivo <code>templates.json</code>.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={deleteDisclosure.onClose} size="sm" variant="ghost">Cancelar</Button>
              <Button bg="danger" color="white" onClick={handleDeleteConfirm} ml={3} size="sm" leftIcon={<Trash2 size={14} />}>
                Confirmar Eliminación
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* MODAL 4: COMPONENTE AISLADO DE PREVISUALIZACIÓN */}
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