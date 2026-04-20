"use client";

import { useState, useRef } from "react";
import {
  Box, Flex, VStack, Heading, Select, FormControl, FormLabel,
  Input, Text, Button, Card, CardBody, Image, Table, Thead, Tbody, Tr, Th, Td, IconButton, HStack
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

interface Campo {
  nombre: string;
  indicador: string;
  tipo: "Texto" | "Tabla" | "Lista";
  buscar_bd: string;
  columnas?: string[];
}

interface Template {
  tipo_solicitud: string;
  modelo_carta: string;
  campos: Campo[];
}

interface Props {
  groups: any[];
  templates: Template[];
  generalData: any;
  actividades?: any[]; // Nueva prop para actividades
}

export default function LetterGeneratorClient({ groups, templates, generalData, actividades }: Props) {
  const [templateSeleccionado, setTemplateSeleccionado] = useState<Template | null>(null);
  const [valoresCampos, setValoresCampos] = useState<Record<string, any>>({});
  const documentRef = useRef<HTMLDivElement>(null);

  const currentGroup = groups.find(g => g.title === "LAMUN");

  const ESCUELAS_POR_FACULTAD: Record<string, string[]> = {
    Agronomía: ["Agronomía"],
    "Arquitectura y Urbanismo": ["Arquitectura"],
    Ciencias: [
      "Computación",
      "Biología",
      "Matemática",
      "Física",
      "Química",
      "Geoquímica",
    ],
    "Ciencias Económicas y Sociales": [
      "Administración y Contaduría",
      "Antropología",
      "Estadística y Ciencias Actuariales",
      "Economía",
      "Estudios Internacionales",
      "Sociología",
      "Trabajo Social"
    ],
    Farmacia: ["Farmacia"],
    "Humanidades y Educación": [
      "Artes",
      "Bibliotecología y Archivología",
      "Comunicación Social",
      "Educación",
      "Filosofía",
      "Geografía",
      "Historia",
      "Idiomas Modernos",
      "Letras",
      "Psicología"
    ],
    Ingeniería: [
      "Ciclo Básico de Ingeniería",
      "Ingeniería Civil",
      "Ingeniería Eléctrica",
      "Ingeniería Geológica, Minas y Geofísica",
      "Ingeniería Mecánica",
      "Ingeniería Metalúrgica y Ciencias de los Materiales",
      "Ingeniería Química",
      "Ingeniería de Petróleo",
      "Ingeniería de Procesos Industriales"
    ],
    "Ciencias Jurídicas y Políticas": [
      "Derecho",
      "Estudios Políticos y Administrativos"
    ],
    Medicina: [
      "Bioanálisis",
      "Enfermería",
      "Medicina Dr. Luis Razetti",
      "Medicina Dr. José María Vargas",
      "Nutrición y Dietética",
      "Salud Pública"
    ],
    Odontología: ["Odontología"],
    Veterinaria: ["Medicina Veterinaria"],
  };

  // --- LÓGICA DE FECHA EN ESPAÑOL ---
  const getFechaFormateada = () => {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = meses[hoy.getMonth()];
    const anio = hoy.getFullYear();
    return `Caracas, ${dia} de ${mes} de ${anio}`;
  };

  // --- LÓGICA DE FECHAS DE ACTIVIDAD ---
  const formatFechaActividad = (dateStr: string) => {
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const d = new Date(dateStr + "T00:00:00");
    return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} del ${d.getFullYear()}`;
  };

  // --- MANEJO DE SELECCIÓN DE ACTIVIDAD ---
  const handleActividadSelect = (actividadTitle: string) => {
    const act = actividades.find(a => a.title === actividadTitle);
    if (!act) return;

    const esMismoDia = act.date_start === act.date_end;
    
    setValoresCampos(prev => ({
      ...prev,
      "<nombre_actividad>": act.title,
      "<lugar_actividad>": act.place,
      "<intervalo>": esMismoDia ? "el día" : "entre los días",
      "<fecha>": esMismoDia 
        ? formatFechaActividad(act.date_start)
        : `${formatFechaActividad(act.date_start)} y ${formatFechaActividad(act.date_end)}`,
      // Estos valores suelen ser manuales o venir de la actividad si existieran:
      "<hora_inicio>": "08:00 am", 
      "<hora_fin>": "04:00 pm"
    }));
  };

  // --- MANEJO DE COORDINADOR Y FACULTAD ---
  const handleCoordinadorChange = (nombre: string) => {
    const coord = generalData.coordinadores.find((c: any) => c.coordinador === nombre);
    setValoresCampos(prev => ({
      ...prev,
      "<nombre_coordinador>": nombre,
      "<facultad_coordinador>": coord?.facultad || "",
      "<nombre_escuela>": "" // Resetear escuela al cambiar facultad
    }));
  };

  // --- FILTRADO DE MIEMBROS POR ESCUELA ---
  const getAvailableMembers = () => {
    const escuelaSeleccionada = valoresCampos["<nombre_escuela>"];
    if (!escuelaSeleccionada || !currentGroup) return [];
    
    // Filtramos miembros que pertenecen a la escuela seleccionada
    return currentGroup.members.filter((m: any) => 
      m.escuela === escuelaSeleccionada && 
      !(valoresCampos["TABLA_Miembros"] || []).some((sel: any) => sel.name === m.name)
    );
  };

  // Renderizado de inputs especiales
  const renderInputEspecial = (campo: Campo) => {
    // Caso 1: Select de Coordinadores
    if (campo.indicador === "<nombre_coordinador>") {
      return (
        <Select size="sm" onChange={(e) => handleCoordinadorChange(e.target.value)}>
          <option value="">Seleccionar...</option>
          {generalData.coordinadores.map((c: any) => (
            <option key={c.coordinador} value={c.coordinador}>{c.coordinador}</option>
          ))}
        </Select>
      );
    }

    // Caso 2: Select de Escuelas (Dependiente de Facultad)
    if (campo.indicador === "<nombre_escuela>") {
      const facultad = valoresCampos["<facultad_coordinador>"];
      const escuelas = ESCUELAS_POR_FACULTAD[facultad] || [];
      return (
        <Select size="sm" value={valoresCampos["<nombre_escuela>"]} onChange={(e) => handleInputChange("<nombre_escuela>", e.target.value)}>
          <option value="">Seleccionar escuela...</option>
          {escuelas.map(e => <option key={e} value={e}>{e}</option>)}
        </Select>
      );
    }

    // Caso 3: Select de Actividades (Solo del grupo LAMUN)
    if (campo.indicador === "<nombre_actividad>") {
      return (
        <Select size="sm" onChange={(e) => handleActividadSelect(e.target.value)}>
          <option value="">Seleccionar actividad...</option>
          {actividades.filter(a => a.group === "LAMUN").map(a => (
            <option key={a.id} value={a.title}>{a.title}</option>
          ))}
        </Select>
      );
    }

    // Default
    return (
      <Input 
        size="sm" 
        value={valoresCampos[campo.indicador] || ""} 
        isReadOnly={!!campo.buscar_bd && campo.indicador !== "<nombre_actividad>"}
        bg={campo.buscar_bd && campo.indicador !== "<nombre_actividad>" ? "gray.100" : "white"}
        onChange={(e) => handleInputChange(campo.indicador, e.target.value)}
      />
    );
  };

  const handleTemplateChange = (tipo: string) => {
    const found = templates.find((t) => t.tipo_solicitud === tipo);
    if (found) {
      setTemplateSeleccionado(found);
      const initialValues: Record<string, any> = {};

      found.campos.forEach((campo) => {
        if (campo.tipo === "Tabla") {
          initialValues[campo.indicador] = []; 
        } else {
          if (campo.buscar_bd && currentGroup) {
            const prop = campo.buscar_bd.split(".")[1];
            initialValues[campo.indicador] = currentGroup[prop] || "";
          } else {
            initialValues[campo.indicador] = "";
          }
        }
      });
      setValoresCampos(initialValues);
    }
  };

  const handleInputChange = (indicador: string, valor: string) => {
    setValoresCampos(prev => ({ ...prev, [indicador]: valor }));
  };

  // --- LÓGICA DE TABLA (MIEMBROS O ACTIVIDADES) ---
  const addItemToTable = (indicador: string, itemId: string) => {
    if (!itemId) return;
    
    // Buscar en miembros del grupo o en actividades
    const itemObj = 
      currentGroup?.members.find((m: any) => m.name === itemId) || 
      actividades.find((a: any) => a.nombre === itemId); // Suponiendo que 'nombre' es la clave

    if (itemObj) {
      setValoresCampos(prev => ({
        ...prev,
        [indicador]: [...(prev[indicador] || []), itemObj]
      }));
    }
  };

  const removeItemFromTable = (indicador: string, index: number) => {
    const newRows = [...valoresCampos[indicador]];
    newRows.splice(index, 1);
    setValoresCampos(prev => ({ ...prev, [indicador]: newRows }));
  };

  const getAvailableOptions = (indicador: string) => {
    const campo = templateSeleccionado?.campos.find(c => c.indicador === indicador);
    const selectedIds = valoresCampos[indicador]?.map((item: any) => item.name || item.nombre) || [];

    if (campo?.buscar_bd === "members") {
      return currentGroup?.members.filter((m: any) => !selectedIds.includes(m.name)) || [];
    }
    if (campo?.buscar_bd === "actividades") {
      return actividades.filter((a: any) => !selectedIds.includes(a.nombre)) || [];
    }
    return [];
  };

  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = documentRef.current;
    const opt = {
      margin: 0,
      filename: `${templateSeleccionado?.tipo_solicitud}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const renderContent = () => {
    if (!templateSeleccionado) return <Text>Esperando selección...</Text>;
    const parts = templateSeleccionado.modelo_carta.split(/(<tabla:.*?>)/g);

    return parts.map((part, i) => {
      const tableMatch = part.match(/<tabla:(.*?)>/);
      if (tableMatch) {
        const indicador = tableMatch[1];
        const rows = valoresCampos[indicador] || [];
        const config = templateSeleccionado.campos.find(c => c.indicador === indicador);
        
        return (
          <Box key={i} my={4}>
            <Table variant="simple" size="sm" border="1px solid black">
              <Thead bg="gray.100">
                <Tr>
                  {config?.columnas?.map(col => (
                    <Th key={col} border="1px solid black" color="black" py={2}>{col.toUpperCase()}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((row: any, rowIndex: number) => (
                  <Tr key={rowIndex}>
                    {config?.columnas?.map(col => (
                      <Td key={col} border="1px solid black">{row[col] || "-"}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        );
      }

      let replacedText = part;
      templateSeleccionado.campos.forEach(campo => {
        if (campo.tipo === "Texto") {
          replacedText = replacedText.split(campo.indicador).join(valoresCampos[campo.indicador] || `[${campo.nombre}]`);
        }
      });

      return <Text key={i} as="span" display="inline" whiteSpace="pre-wrap">{replacedText}</Text>;
    });
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex gap={8} direction={{ base: "column", lg: "row" }} align="flex-start">
        
        {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
        <VStack w={{ base: "100%", lg: "35%" }} spacing={6} align="stretch">
          <Card shadow="sm" borderTop="4px solid" borderColor="blue.500">
            <CardBody>
              <FormControl>
                <FormLabel fontWeight="bold">Tipo de Documento</FormLabel>
                <Select placeholder="Seleccionar template..." onChange={(e) => handleTemplateChange(e.target.value)}>
                  {templates.map((t) => (
                    <option key={t.tipo_solicitud} value={t.tipo_solicitud}>{t.tipo_solicitud}</option>
                  ))}
                </Select>
              </FormControl>
            </CardBody>
          </Card>

          {templateSeleccionado && (
            <Card shadow="sm">
              <CardBody>
                <VStack spacing={5} align="stretch">
                  <Heading size="xs" textTransform="uppercase" color="gray.500">Datos del Documento</Heading>
                  {templateSeleccionado.campos.map((campo) => (
                    <Box key={campo.indicador}>
                      <FormLabel fontSize="xs" fontWeight="bold" mb={1}>{campo.nombre}</FormLabel>
                      {campo.tipo === "Texto" ? (
                        <Input 
                          size="sm" 
                          bg={campo.buscar_bd ? "gray.100" : "white"}
                          isReadOnly={!!campo.buscar_bd}
                          value={valoresCampos[campo.indicador] || ""} 
                          onChange={(e) => handleInputChange(campo.indicador, e.target.value)}
                        />
                      ) : (
                        <VStack align="stretch">
                          {valoresCampos[campo.indicador]?.map((item: any, idx: number) => (
                            <HStack key={idx} bg="blue.50" p={1} borderRadius="md" justify="space-between">
                              <Text fontSize="xs" fontWeight="bold">{item.name || item.nombre}</Text>
                              <IconButton 
                                aria-label="remove" icon={<DeleteIcon />} size="xs" colorScheme="red" variant="ghost"
                                onClick={() => removeItemFromTable(campo.indicador, idx)}
                              />
                            </HStack>
                          ))}
                          <Select 
                            size="sm" 
                            placeholder={`Añadir ${campo.nombre}...`}
                            onChange={(e) => {
                                addItemToTable(campo.indicador, e.target.value);
                                e.target.value = "";
                            }}
                          >
                            {getAvailableOptions(campo.indicador).map((opt: any) => (
                              <option key={opt.name || opt.nombre} value={opt.name || opt.nombre}>
                                {opt.name || opt.nombre} {opt.ci ? `- ${opt.ci}` : ""}
                              </option>
                            ))}
                          </Select>
                        </VStack>
                      )}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          <Button colorScheme="blue" size="lg" onClick={handleDownloadPDF} isDisabled={!templateSeleccionado}>
            Generar PDF Oficial
          </Button>
        </VStack>

        {/* PANEL DERECHO: VISTA PREVIA */}
        <Box 
          ref={documentRef}
          bg="white" 
          w="210mm" 
          minH="297mm" 
          boxShadow="xl"
          sx={{ "& *": { fontFamily: "Arial !important" } }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <td>
                  <Box p="15mm 20mm 5mm 20mm">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Image src="/UCV.png" h="65px" ignoreFallback />
                      <Image src="/logo.png" h="65px" ignoreFallback />
                    </Flex>
                    <VStack spacing={0} align="center">
                      <Text fontWeight="bold" fontSize="11pt">UNIVERSIDAD CENTRAL DE VENEZUELA</Text>
                      <Box h="1.5px" bg="black" w="full" my={1} />
                      <Text fontWeight="bold" fontSize="9pt">DIRECCIÓN DE EXTENSIÓN UNIVERSITARIA</Text>
                    </VStack>
                    
                    {/* NUEVO: DEU-GSU y Fecha */}
                    <Box mt={4}>
                      <Text fontWeight="bold" fontSize="12pt">DEU-GSU</Text>
                      <Text textAlign="right" fontSize="11pt">{getFechaFormateada()}</Text>
                    </Box>
                  </Box>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <Box p="10mm 20mm" minH="180mm" textAlign="justify" fontSize="11pt" lineHeight="1.6">
                    {renderContent()}

                    {/* NUEVO: Atentamente */}
                    {templateSeleccionado && (
                      <Text mt={8}>Atentamente.</Text>
                    )}

                    {/* FIRMA */}
                    {templateSeleccionado && (
                      <VStack mt={16} spacing={0} align="center" style={{ pageBreakInside: 'avoid' }}>
                        <Box borderTop="1.5px solid black" w="260px" mb={2} />
                        <Text fontWeight="bold" fontSize="11pt">{generalData.director.director_extension}</Text>
                        <Text fontWeight="bold" fontSize="11pt">
                            {generalData.director.director_genero === "Femenino" ? "Directora" : "Director"} de Extensión Universitaria
                        </Text>
                      </VStack>
                    )}
                  </Box>
                </td>
              </tr>
            </tbody>

            <tfoot>
              <tr>
                <td>
                  <Box p="5mm 20mm 15mm 20mm" textAlign="center">
                    <Box h="2px" bg="gray.300" w="full" mb={2} />
                    <Text fontWeight="bold" fontSize="8.5pt" color="gray.700">{generalData.pie_pagina}</Text>
                    <Text fontSize="8pt" color="gray.500">{generalData.info}</Text>
                  </Box>
                </td>
              </tr>
            </tfoot>
          </table>
        </Box>
      </Flex>
    </Box>
  );
}