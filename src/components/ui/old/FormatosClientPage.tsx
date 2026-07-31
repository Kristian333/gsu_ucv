"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import OrderedList from "@tiptap/extension-ordered-list";
import {TextStyle} from "@tiptap/extension-text-style";
import { Mark, mergeAttributes } from "@tiptap/core";
import {
  Box, Flex, VStack, HStack, Heading, Select, FormControl, FormLabel,
  Input, Button, Card, CardBody, Text, Textarea, useToast, useDisclosure,
  IconButton, List, ListItem, Divider, Badge, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from "@chakra-ui/react";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, AlignCenter, AlignRight,
   List as ListIconLucide, ListOrdered, HelpCircle, Eye, Save, XCircle, PlusCircle, Grid, ChevronDown, Trash2, Type
} from "lucide-react";

import { saveTemplates } from "./actions";
import TemplatePreviewModal from "@/components/ui/TemplatePreviewModal";

// Extensión personalizada inline para soportar tamaños de letra en Tiptap (Font Size)
const FontSize = Mark.create({
  name: "fontSize",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, "") || null,
        renderHTML: attributes => {
          if (!attributes.size) {
            return {};
          }
          return {
            style: `font-size: ${attributes.size}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[style*='font-size']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) => {
          return chain().setMark(this.name, { size }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

interface FormatosClientPageProps {
  initialTemplates: any[];
  generalData: any;
}

// Opciones de tamaños estandarizados tipo Word
const FONT_SIZES = ["9pt", "10pt", "11pt", "12pt", "14pt", "16pt", "18pt", "20pt", "24pt"];

export default function FormatosClientPage({ initialTemplates, generalData }: FormatosClientPageProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isNew, setIsNew] = useState(false);
  
  // Estado para forzar el re-render de la barra de herramientas en cambios de cursor
  const [, setSelectionCounter] = useState(0);
  
  // Estados de los campos mutables
  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const [notas, setNotas] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  
  // Navegación interceptada
  const [pendingSelectionId, setPendingSelectionId] = useState<string | null>(null);

  const toast = useToast();
  const previewDisclosure = useDisclosure();
  const alertDisclosure = useDisclosure();
  const guideDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();

  // Configuración de Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        orderedList: false,
        strike: false, // <-- Desactivamos strike interno para evitar el duplicado
      }),
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

  // Carga de datos de plantilla al seleccionar
  useEffect(() => {
    if (!selectedId || isNew) return;
    const current = templates.find(t => String(t.id) === selectedId);
    if (current) {
      setTipoSolicitud(current.tipo_solicitud);
      setNotas(current.notas || "");
      editor?.commands.setContent(current.modelo_carta);
      setTimeout(() => setIsDirty(false), 50);
    }
  }, [selectedId, templates, editor, isNew]);

  // Monitorear cambios manuales en inputs comunes
  const trackFieldChange = (setter: any, val: string) => {
    setter(val);
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
        editor?.commands.setContent(current.modelo_carta);
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
      editor?.commands.setContent("<p>Escriba aquí el cuerpo del formato institucional...</p>");
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
    const cuerpoCarta = editor?.getHTML() || "";
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
        editor?.commands.setContent("");
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
      editor?.commands.setContent("");
    } else {
      setIsNew(false);
      setSelectedId(pendingSelectionId || "");
    }
    setPendingSelectionId(null);
  };

  // Función interactiva para insertar tablas dinámicas
  const handleInsertTableCustom = () => {
    const rowsInput = prompt("Ingrese el número de filas:", "3");
    const colsInput = prompt("Ingrese el número de columnas:", "3");
    
    const rows = parseInt(rowsInput || "", 10);
    const cols = parseInt(colsInput || "", 10);

    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
      toast({ title: "Entrada inválida", description: "Debe ingresar números válidos mayores a 0", status: "warning" });
      return;
    }

    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  // Manejador del comando personalizado de tamaño
  const handleFontSizeChange = (size: string) => {
    if (!editor) return;
    if (size === "normal") {
      (editor.commands as any).unsetFontSize();
    } else {
      (editor.commands as any).setFontSize(size);
    }
  };

  const handleCustomFontSize = () => {
    const customSize = prompt("Ingrese el tamaño de letra (Ej: 30px, 2.5rem, 14pt):", "30pt");
    if (customSize && customSize.trim() !== "") {
      // Si el usuario solo pone un número (ej: "30"), le concatenamos "pt" por defecto
      const finalSize = isNaN(Number(customSize)) ? customSize : `${customSize}pt`;
      handleFontSizeChange(finalSize);
    }
  };

  // Obtener el tamaño de fuente actual en el cursor
  const getCurrentFontSize = () => {
    if (!editor) return "11pt";
    const attrs = editor.getAttributes("fontSize");
    return attrs?.size || "11pt (Por defecto)";
  };

  // Verificamos si el cursor está en una tabla
  const isInsideTable = editor?.isActive("table") || false;

  // Renderizar las opciones ordenadas alfabéticamente
  const sortedTemplates = [...templates].sort((a, b) => a.tipo_solicitud.localeCompare(b.tipo_solicitud));

  return (
    <Box p={6} bg="gray.200" minH="100vh">
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="md" color="blue.800">Administrador de Formatos Dinámicos</Heading>
          <Text fontSize="sm" color="gray.600">Edición estructural de los formatos para las solicitudes de recursos de los Grupos de Extensión.</Text>
        </VStack>
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
              <Box border="1px solid" borderColor="gray.300" borderRadius="md" overflow="hidden">
                <HStack bg="gray.50" p={2} borderBottom="1px solid" borderColor="gray.300" spacing={1} wrap="wrap">
                  
                  {/* SELECTOR DE TAMAÑO DE LETRA ESTILO WORD */}
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
                  
                  {/* BOTONES DE ESTILO CON COLOR DE ESTADO ACTIVO */}
                  <IconButton 
                    aria-label="Bold" size="sm" icon={<Bold size={16} />} 
                    onClick={() => editor?.chain().focus().toggleBold().run()} 
                    bg={editor?.isActive("bold") ? "secondary" : "transparent"} 
                    color={editor?.isActive("bold") ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive("bold") ? "secondary" : "gray.200" }}
                  />
                  <IconButton 
                    aria-label="Italic" size="sm" icon={<Italic size={16} />} 
                    onClick={() => editor?.chain().focus().toggleItalic().run()} 
                    bg={editor?.isActive("italic") ? "secondary" : "transparent"} 
                    color={editor?.isActive("italic") ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive("italic") ? "secondary" : "gray.200" }}
                  />
                  <IconButton 
                    aria-label="Underline" size="sm" icon={<UnderlineIcon size={16} />} 
                    onClick={() => editor?.chain().focus().toggleUnderline().run()} 
                    bg={editor?.isActive("underline") ? "secondary" : "transparent"} 
                    color={editor?.isActive("underline") ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive("underline") ? "secondary" : "gray.200" }}
                  />
                  <IconButton 
                    aria-label="Strike" size="sm" icon={<Strikethrough size={16} />} 
                    onClick={() => editor?.chain().focus().toggleStrike().run()} 
                    bg={editor?.isActive("strike") ? "secondary" : "transparent"} 
                    color={editor?.isActive("strike") ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive("strike") ? "secondary" : "gray.200" }}
                  />
                  
                  <Divider orientation="vertical" h="20px" mx={1} />
                  
                  <IconButton 
                    aria-label="Left" size="sm" icon={<AlignLeft size={16} />} 
                    onClick={() => editor?.chain().focus().setTextAlign("left").run()} 
                    bg={editor?.isActive({ textAlign: "left" }) ? "secondary" : "transparent"} 
                    color={editor?.isActive({ textAlign: "left" }) ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive({ textAlign: "left" }) ? "secondary" : "gray.200" }}
                  />
                  <IconButton 
                    aria-label="Center" size="sm" icon={<AlignCenter size={16} />} 
                    onClick={() => editor?.chain().focus().setTextAlign("center").run()} 
                    bg={editor?.isActive({ textAlign: "center" }) ? "secondary" : "transparent"} 
                    color={editor?.isActive({ textAlign: "center" }) ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive({ textAlign: "center" }) ? "secondary" : "gray.200" }}
                  />
                  <IconButton 
                    aria-label="Right" size="sm" icon={<AlignRight size={16} />} 
                    onClick={() => editor?.chain().focus().setTextAlign("right").run()} 
                    bg={editor?.isActive({ textAlign: "right" }) ? "secondary" : "transparent"} 
                    color={editor?.isActive({ textAlign: "right" }) ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive({ textAlign: "right" }) ? "secondary" : "gray.200" }}
                  />
                  
                  <Divider orientation="vertical" h="20px" mx={1} />
                  
                  {/* LISTAS SIN ORDENAR Y ORDENADAS */}
                  <IconButton 
                    aria-label="BulletList" size="sm" icon={<ListIconLucide size={16} />} 
                    onClick={() => editor?.chain().focus().toggleBulletList().run()} 
                    bg={editor?.isActive("bulletList") ? "secondary" : "transparent"} 
                    color={editor?.isActive("bulletList") ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive("bulletList") ? "secondary" : "gray.200" }}
                  />
                  <IconButton 
                    aria-label="OrderedList" size="sm" icon={<ListOrdered size={16} />} 
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()} 
                    bg={editor?.isActive("orderedList") ? "secondary" : "transparent"} 
                    color={editor?.isActive("orderedList") ? "white" : "gray.700"}
                    _hover={{ bg: editor?.isActive("orderedList") ? "secondary" : "gray.200" }}
                  />
                  
                  <Divider orientation="vertical" h="20px" mx={1} />
                  
                  {/* MENÚ FLOTANTE PARA TABLAS DINÁMICAS */}
                  <Menu>
                    <MenuButton 
                      as={Button} size="sm" rightIcon={<ChevronDown size={14} />} leftIcon={<Grid size={14} />} 
                      bg={isInsideTable ? "secondary" : "transparent"} 
                      color={isInsideTable ? "white" : "gray.700"}
                      border={isInsideTable ? "none" : "1px solid"}
                      borderColor="gray.300"
                      _hover={{ bg: isInsideTable ? "secondary" : "gray.100" }}
                    >
                      Tablas {isInsideTable && "•"}
                    </MenuButton>
                    <MenuList fontSize="sm">
                      <MenuItem onClick={handleInsertTableCustom}>Insertar Tabla Personalizada...</MenuItem>
                      <MenuItem onClick={() => editor?.chain().focus().addColumnAfter().run()} isDisabled={!isInsideTable}>Agregar Columna Derecha</MenuItem>
                      <MenuItem onClick={() => editor?.chain().focus().deleteColumn().run()} isDisabled={!isInsideTable}>Eliminar Columna</MenuItem>
                      <MenuItem onClick={() => editor?.chain().focus().addRowAfter().run()} isDisabled={!isInsideTable}>Agregar Fila Abajo</MenuItem>
                      <MenuItem onClick={() => editor?.chain().focus().deleteRow().run()} isDisabled={!isInsideTable}>Eliminar Fila</MenuItem>
                      <MenuItem onClick={() => editor?.chain().focus().deleteTable().run()} isDisabled={!isInsideTable} color="danger" fontWeight="bold">Eliminar Tabla Completa</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>

                {/* AREA EDITABLE TIPTAP */}
                <Box p={4} minH="280px" sx={{ 
                    ".ProseMirror:focus": { outline: "none" }, 
                    ".ProseMirror p": { marginBottom: "4px" },
                    ".ProseMirror table": { width: "100%", borderCollapse: "collapse", margin: "12px 0" },
                    ".ProseMirror th, .ProseMirror td": { border: "1px solid #cbd5e0", padding: "6px", minWidth: "50px", position: "relative" },
                    ".ProseMirror th": { backgroundColor: "#edf2f7", fontWeight: "bold" },
                    ".ProseMirror .selectedCellAfter": { backgroundColor: "rgba(200, 200, 255, 0.4)" },
                    ".ProseMirror ul": { paddingLeft: "24px", listStyleType: "disc", marginBottom: "8px" },
                    ".ProseMirror ol": { paddingLeft: "24px", listStyleType: "decimal", marginBottom: "8px" }
                }}>
                  <EditorContent editor={editor} />
                </Box>
              </Box>
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
        modeloCarta={editor?.getHTML() || ""}
        generalData={generalData}
      />
    </Box>
  );
}