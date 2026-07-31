"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
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
  Box, HStack, Button, Divider, Menu, MenuButton, MenuList, MenuItem,
  IconButton, useToast
} from "@chakra-ui/react";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, 
  AlignCenter, AlignRight, List as ListIconLucide, ListOrdered, 
  Grid, ChevronDown, Type 
} from "lucide-react";
import { useEffect, useState } from "react";

// Extensión personalizada para tamaños de fuente
export const FontSize = Mark.create({
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

interface RichTextEditorProps {
  value: string;
  onChange?: (content: string) => void;
  onSelectionChange?: () => void;
  minHeight?: string;
  readOnly?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  onSelectionChange,
  minHeight = "280px",
  readOnly = false,
}: RichTextEditorProps) {
  const toast = useToast();
  const [, setSelectionCounter] = useState(0);

  const editor = useEditor({
    editable: !readOnly,
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
    content: value,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    onSelectionUpdate: () => {
      setSelectionCounter(prev => prev + 1);
      if (onSelectionChange) {
        onSelectionChange();
      }
    },
  });

  // Sincronizar contenido si el prop value cambia externamente
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const handleFontSizeChange = (size: string) => {
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
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const isInsideTable = editor.isActive("table");

  return (
    <Box border="1px solid" borderColor="gray.300" borderRadius="md" overflow="hidden">
      {!readOnly && (
        <HStack bg="gray.50" p={2} borderBottom="1px solid" borderColor="gray.300" spacing={1} wrap="wrap">
          {/* SELECTOR DE TAMAÑO DE LETRA */}
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
                  fontWeight={editor.isActive("fontSize", { size }) ? "bold" : "normal"}
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

          {/* BOTONES DE ESTILO */}
          <IconButton 
            aria-label="Bold" size="sm" icon={<Bold size={16} />} 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            bg={editor.isActive("bold") ? "secondary" : "transparent"} 
            color={editor.isActive("bold") ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive("bold") ? "secondary" : "gray.200" }}
          />
          <IconButton 
            aria-label="Italic" size="sm" icon={<Italic size={16} />} 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            bg={editor.isActive("italic") ? "secondary" : "transparent"} 
            color={editor.isActive("italic") ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive("italic") ? "secondary" : "gray.200" }}
          />
          <IconButton 
            aria-label="Underline" size="sm" icon={<UnderlineIcon size={16} />} 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            bg={editor.isActive("underline") ? "secondary" : "transparent"} 
            color={editor.isActive("underline") ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive("underline") ? "secondary" : "gray.200" }}
          />
          <IconButton 
            aria-label="Strike" size="sm" icon={<Strikethrough size={16} />} 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            bg={editor.isActive("strike") ? "secondary" : "transparent"} 
            color={editor.isActive("strike") ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive("strike") ? "secondary" : "gray.200" }}
          />

          <Divider orientation="vertical" h="20px" mx={1} />

          {/* ALINEACIÓN DE TEXTO */}
          <IconButton 
            aria-label="Left" size="sm" icon={<AlignLeft size={16} />} 
            onClick={() => editor.chain().focus().setTextAlign("left").run()} 
            bg={editor.isActive({ textAlign: "left" }) ? "secondary" : "transparent"} 
            color={editor.isActive({ textAlign: "left" }) ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive({ textAlign: "left" }) ? "secondary" : "gray.200" }}
          />
          <IconButton 
            aria-label="Center" size="sm" icon={<AlignCenter size={16} />} 
            onClick={() => editor.chain().focus().setTextAlign("center").run()} 
            bg={editor.isActive({ textAlign: "center" }) ? "secondary" : "transparent"} 
            color={editor.isActive({ textAlign: "center" }) ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive({ textAlign: "center" }) ? "secondary" : "gray.200" }}
          />
          <IconButton 
            aria-label="Right" size="sm" icon={<AlignRight size={16} />} 
            onClick={() => editor.chain().focus().setTextAlign("right").run()} 
            bg={editor.isActive({ textAlign: "right" }) ? "secondary" : "transparent"} 
            color={editor.isActive({ textAlign: "right" }) ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive({ textAlign: "right" }) ? "secondary" : "gray.200" }}
          />

          <Divider orientation="vertical" h="20px" mx={1} />

          {/* LISTAS */}
          <IconButton 
            aria-label="BulletList" size="sm" icon={<ListIconLucide size={16} />} 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            bg={editor.isActive("bulletList") ? "secondary" : "transparent"} 
            color={editor.isActive("bulletList") ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive("bulletList") ? "secondary" : "gray.200" }}
          />
          <IconButton 
            aria-label="OrderedList" size="sm" icon={<ListOrdered size={16} />} 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            bg={editor.isActive("orderedList") ? "secondary" : "transparent"} 
            color={editor.isActive("orderedList") ? "white" : "gray.700"}
            _hover={{ bg: editor.isActive("orderedList") ? "secondary" : "gray.200" }}
          />

          <Divider orientation="vertical" h="20px" mx={1} />

          {/* TABLAS */}
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
              <MenuItem onClick={() => editor.chain().focus().addColumnAfter().run()} isDisabled={!isInsideTable}>Agregar Columna Derecha</MenuItem>
              <MenuItem onClick={() => editor.chain().focus().deleteColumn().run()} isDisabled={!isInsideTable}>Eliminar Columna</MenuItem>
              <MenuItem onClick={() => editor.chain().focus().addRowAfter().run()} isDisabled={!isInsideTable}>Agregar Fila Abajo</MenuItem>
              <MenuItem onClick={() => editor.chain().focus().deleteRow().run()} isDisabled={!isInsideTable}>Eliminar Fila</MenuItem>
              <MenuItem onClick={() => editor.chain().focus().deleteTable().run()} isDisabled={!isInsideTable} color="red.500" fontWeight="bold">Eliminar Tabla Completa</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      )}

      {/* ÁREA EDITABLE PROSEMIRROR */}
      <Box p={4} minH={minHeight} sx={{ 
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
  );
}