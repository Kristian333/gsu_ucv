"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import OrderedList from "@tiptap/extension-ordered-list";
import { TextStyle } from "@tiptap/extension-text-style";
import { Mark, mergeAttributes } from "@tiptap/core";
import {
  Box, Flex, VStack, HStack, Heading, FormControl, FormLabel,
  Button, Text, useToast, useDisclosure, IconButton, Divider,
  Menu, MenuButton, MenuList, MenuItem, Select, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Spinner, Code
} from "@chakra-ui/react";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, 
  AlignCenter, AlignRight, List as ListIconLucide, ListOrdered, FileText, 
  Eye, CheckCircle, XCircle, Grid, ChevronDown, Type, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import TemplatePreviewModal, { PreviewModalMode } from "@/components/ui/TemplatePreviewModal";

// Extensión para tamaños de fuente
const FontSize = Mark.create({
  name: "fontSize",
  addOptions() { return { HTMLAttributes: {} }; },
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, "") || null,
        renderHTML: attributes => attributes.size ? { style: `font-size: ${attributes.size}` } : {},
      },
    };
  },
  parseHTML() { return [{ tag: "span[style*='font-size']" }]; },
  renderHTML({ HTMLAttributes }) { return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]; },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }) => chain().setMark(this.name, { size }).run(),
      unsetFontSize: () => ({ chain }) => chain().unsetMark(this.name).run(),
    };
  },
});

const FONT_SIZES = ["9pt", "10pt", "11pt", "12pt", "14pt", "16pt", "18pt", "20pt", "24pt"];

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
  const [, setIsDirty] = useState(false);
  const [, setSelectionCounter] = useState(0);

  // Selección de firmante de la DEU
  const [selectedMemberId, setSelectedMemberId] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<PreviewModalMode>("preview_previa_s_r");

  const previewDisclosure = useDisclosure();
  const templateModalDisclosure = useDisclosure();

  // Configuración de TipTap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ orderedList: false, strike: false }),
      Underline,
      Strike,
      OrderedList,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      FontSize,
    ],
    content: "",
    onUpdate: () => setIsDirty(true),
    onSelectionUpdate: () => setSelectionCounter(prev => prev + 1),
  });

  // Cargar datos de la BD usando apiRequest
  const fetchSolicitud = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`/admin/group-resource-requests/${requestId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSolicitud(result);
      if (result.contenido) {
        editor?.commands.setContent(result.contenido);
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
  }, [requestId, editor, toast, token]);

  useEffect(() => {
    if (isHydrated) {
      fetchSolicitud();
    }
  }, [isHydrated, fetchSolicitud]);

  // Handlers para formato de texto
  const handleFontSizeChange = (size: string) => {
    if (!editor) return;
    if (size === "normal") {
      (editor.commands as any).unsetFontSize();
    } else {
      (editor.commands as any).setFontSize(size);
    }
  };

  const handleCustomFontSize = () => {
    const customSize = prompt("Ingrese el tamaño de letra (Ej: 30pt, 16px):", "14pt");
    if (customSize && customSize.trim() !== "") {
      const finalSize = isNaN(Number(customSize)) ? customSize : `${customSize}pt`;
      handleFontSizeChange(finalSize);
    }
  };

  const getCurrentFontSize = () => {
    if (!editor) return "11pt";
    const attrs = editor.getAttributes("fontSize");
    return attrs?.size || "11pt (Por defecto)";
  };

  const handleInsertTableCustom = () => {
    const rows = parseInt(prompt("Ingrese el número de filas:", "3") || "", 10);
    const cols = parseInt(prompt("Ingrese el número de columnas:", "3") || "", 10);

    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
      toast({ title: "Entrada inválida", status: "warning" });
      return;
    }
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
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

  const isInsideTable = editor?.isActive("table") || false;

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
              Grupo ID: <strong>#{solicitud?.grupo_id}</strong> | Solicitud ID: #{solicitud?.id}
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
            <Box border="1px solid" borderColor="gray.300" borderRadius="md" overflow="hidden">
              
              {/* BARRA DE HERRAMIENTAS TIPTAP */}
              <HStack bg="gray.50" p={2} borderBottom="1px solid" borderColor="gray.300" spacing={1} wrap="wrap">
                <Menu>
                  <MenuButton 
                    as={Button} size="sm" variant="outline" rightIcon={<ChevronDown size={14} />} leftIcon={<Type size={14} />}
                    borderColor="gray.300" bg="white" fontSize="xs" minW="110px" textAlign="left"
                  >
                    {getCurrentFontSize()}
                  </MenuButton>
                  <MenuList maxHeight="200px" overflowY="auto" fontSize="sm">
                    <MenuItem onClick={() => handleFontSizeChange("normal")}>Por Defecto (11pt)</MenuItem>
                    {FONT_SIZES.map(size => (
                      <MenuItem 
                        key={size} 
                        onClick={() => handleFontSizeChange(size)}
                        fontWeight={editor?.isActive("fontSize", { size }) ? "bold" : "normal"}
                      >
                        {size}
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={handleCustomFontSize} color="blue.600" fontWeight="bold">
                      Personalizado...
                    </MenuItem>
                  </MenuList>
                </Menu>

                <Divider orientation="vertical" h="20px" mx={1} />
                
                <IconButton 
                  aria-label="Bold" size="sm" icon={<Bold size={16} />} 
                  onClick={() => editor?.chain().focus().toggleBold().run()} 
                  bg={editor?.isActive("bold") ? "secondary" : "transparent"} 
                  color={editor?.isActive("bold") ? "white" : "gray.700"}
                />
                <IconButton 
                  aria-label="Italic" size="sm" icon={<Italic size={16} />} 
                  onClick={() => editor?.chain().focus().toggleItalic().run()} 
                  bg={editor?.isActive("italic") ? "secondary" : "transparent"} 
                  color={editor?.isActive("italic") ? "white" : "gray.700"}
                />
                <IconButton 
                  aria-label="Underline" size="sm" icon={<UnderlineIcon size={16} />} 
                  onClick={() => editor?.chain().focus().toggleUnderline().run()} 
                  bg={editor?.isActive("underline") ? "secondary" : "transparent"} 
                  color={editor?.isActive("underline") ? "white" : "gray.700"}
                />
                <IconButton 
                  aria-label="Strike" size="sm" icon={<Strikethrough size={16} />} 
                  onClick={() => editor?.chain().focus().toggleStrike().run()} 
                  bg={editor?.isActive("strike") ? "secondary" : "transparent"} 
                  color={editor?.isActive("strike") ? "white" : "gray.700"}
                />
                
                <Divider orientation="vertical" h="20px" mx={1} />
                
                <IconButton 
                  aria-label="Left" size="sm" icon={<AlignLeft size={16} />} 
                  onClick={() => editor?.chain().focus().setTextAlign("left").run()} 
                  bg={editor?.isActive({ textAlign: "left" }) ? "secondary" : "transparent"} 
                  color={editor?.isActive({ textAlign: "left" }) ? "white" : "gray.700"}
                />
                <IconButton 
                  aria-label="Center" size="sm" icon={<AlignCenter size={16} />} 
                  onClick={() => editor?.chain().focus().setTextAlign("center").run()} 
                  bg={editor?.isActive({ textAlign: "center" }) ? "secondary" : "transparent"} 
                  color={editor?.isActive({ textAlign: "center" }) ? "white" : "gray.700"}
                />
                <IconButton 
                  aria-label="Right" size="sm" icon={<AlignRight size={16} />} 
                  onClick={() => editor?.chain().focus().setTextAlign("right").run()} 
                  bg={editor?.isActive({ textAlign: "right" }) ? "secondary" : "transparent"} 
                  color={editor?.isActive({ textAlign: "right" }) ? "white" : "gray.700"}
                />
                
                <Divider orientation="vertical" h="20px" mx={1} />
                
                <IconButton 
                  aria-label="BulletList" size="sm" icon={<ListIconLucide size={16} />} 
                  onClick={() => editor?.chain().focus().toggleBulletList().run()} 
                  bg={editor?.isActive("bulletList") ? "secondary" : "transparent"} 
                  color={editor?.isActive("bulletList") ? "white" : "gray.700"}
                />
                <IconButton 
                  aria-label="OrderedList" size="sm" icon={<ListOrdered size={16} />} 
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()} 
                  bg={editor?.isActive("orderedList") ? "secondary" : "transparent"} 
                  color={editor?.isActive("orderedList") ? "white" : "gray.700"}
                />
                
                <Divider orientation="vertical" h="20px" mx={1} />
                
                <Menu>
                  <MenuButton 
                    as={Button} size="sm" rightIcon={<ChevronDown size={14} />} leftIcon={<Grid size={14} />} 
                    bg={isInsideTable ? "secondary" : "transparent"} 
                    color={isInsideTable ? "white" : "gray.700"}
                    border={isInsideTable ? "none" : "1px solid"}
                    borderColor="gray.300"
                  >
                    Tablas {isInsideTable && "•"}
                  </MenuButton>
                  <MenuList fontSize="sm">
                    <MenuItem onClick={handleInsertTableCustom}>Insertar Tabla Personalizada...</MenuItem>
                    <MenuItem onClick={() => editor?.chain().focus().addColumnAfter().run()} isDisabled={!isInsideTable}>Agregar Columna Derecha</MenuItem>
                    <MenuItem onClick={() => editor?.chain().focus().deleteColumn().run()} isDisabled={!isInsideTable}>Eliminar Columna</MenuItem>
                    <MenuItem onClick={() => editor?.chain().focus().addRowAfter().run()} isDisabled={!isInsideTable}>Agregar Fila Abajo</MenuItem>
                    <MenuItem onClick={() => editor?.chain().focus().deleteRow().run()} isDisabled={!isInsideTable}>Eliminar Fila</MenuItem>
                    <MenuItem onClick={() => editor?.chain().focus().deleteTable().run()} isDisabled={!isInsideTable} color="red.500" fontWeight="bold">Eliminar Tabla Completa</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>

              {/* AREA EDITABLE */}
              <Box p={4} minH="300px" sx={{ 
                ".ProseMirror:focus": { outline: "none" }, 
                ".ProseMirror p": { marginBottom: "4px" },
                ".ProseMirror table": { width: "100%", borderCollapse: "collapse", margin: "12px 0" },
                ".ProseMirror th, .ProseMirror td": { border: "1px solid #cbd5e0", padding: "6px", minWidth: "50px" },
                ".ProseMirror th": { backgroundColor: "#edf2f7", fontWeight: "bold" },
                ".ProseMirror ul": { paddingLeft: "24px", listStyleType: "disc" },
                ".ProseMirror ol": { paddingLeft: "24px", listStyleType: "decimal" }
              }}>
                <EditorContent editor={editor} />
              </Box>
            </Box>
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
        modeloCarta={editor?.getHTML() || ""}
        generalData={getSelectedFirmanteData()}
        mode={previewMode}
        onConfirmApprove={handleConfirmApprove}
      />
    </Box>
  );
}