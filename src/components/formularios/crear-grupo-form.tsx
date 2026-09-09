"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  VStack,
  Heading,
  Text,
  Textarea,
  useToast,
  Link,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Grid,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";
import * as XLSX from "xlsx";
import { FACULTADES, ESCUELAS_POR_FACULTAD } from "@/constants/facultades";
import { TIPOS_ACTIVIDAD } from "@/constants/types";

interface Miembro {
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  coordinacion: string;
  anio: string;
  facultad: string;
  escuela: string;
  documento?: File | null;
  documentoPreview?: string | null;
  isVerified?: boolean;
}

type MiembroStringField =
  | "nombre"
  | "cedula"
  | "telefono"
  | "correo"
  | "coordinacion"
  | "anio"
  | "facultad"
  | "escuela";

const OPCION_NINGUNA_FACULTAD = "No pertenecemos a ninguna facultad";

export default function CrearGrupoForm() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ESTADOS DEL FORMULARIO
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    esMultidisciplinario: false,
    facultad: [] as string[],
    fechaFundacion: "",
    objetivo: "",
    tipo: [] as string[],
    otrosTipo: "",
    observaciones: "",
    liderCedula: "",
  });

  const miembroVacio = (): Miembro => ({
    nombre: "",
    cedula: "",
    telefono: "",
    correo: "",
    coordinacion: "",
    anio: "",
    facultad: "",
    escuela: "",
    isVerified: false,
  });

  const comprobarCedula = (index: number) => {
    const cedulaAChequear = miembros[index].cedula.trim();

    if (!cedulaAChequear) {
      return toast({
        title: "Cédula vacía",
        status: "warning",
        duration: 2000,
      });
    }

    // Verificar si existe en otros índices que no sean el actual
    const existe = miembros.some((m, i) => m.cedula === cedulaAChequear && i !== index);

    if (existe) {
      return toast({
        title: "Cédula duplicada",
        description: "Este miembro ya ha sido agregado a la lista.",
        status: "error",
        duration: 3000,
      });
    }

    // Si todo está bien, "abrimos" los demás campos
    const updated = [...miembros];
    updated[index].isVerified = true;
    setMiembros(updated);
    
    toast({
      title: "Cédula válida",
      status: "success",
      duration: 1000,
    });
  };

  const [miembros, setMiembros] = useState<Miembro[]>(
    Array.from({ length: 5 }, miembroVacio)
  );

  const [miembrosGuardados, setMiembrosGuardados] = useState<Miembro[]>([]);

  const handleMultidisciplinarioChange = (isMulti: boolean) => {
    setForm({
      ...form,
      esMultidisciplinario: isMulti,
      facultad: [] 
    });
  };

  const handleCheckboxFacultadChange = (selectedValues: string[]) => {
    const teniaNinguna = form.facultad.includes(OPCION_NINGUNA_FACULTAD);
    const tieneNingunaAhora = selectedValues.includes(OPCION_NINGUNA_FACULTAD);

    if (!teniaNinguna && tieneNingunaAhora) {
      // Si acaba de seleccionar "No pertenecemos a ninguna facultad", limpiamos lo demás
      setForm({ ...form, facultad: [OPCION_NINGUNA_FACULTAD] });
    } else if (teniaNinguna && selectedValues.length > 1) {
      // Si tenía la opción especial y selecciona una facultad, quitamos la opción especial
      setForm({ ...form, facultad: selectedValues.filter(v => v !== OPCION_NINGUNA_FACULTAD) });
    } else {
      setForm({ ...form, facultad: selectedValues });
    }
  };

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pdfProyecto, setPdfProyecto] = useState<File | null>(null);
  const [archivoMiembros, setArchivoMiembros] = useState<File | null>(null);

  // FUNCIONES DE CAMBIO
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleProyecto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfProyecto(file);
  };

  const handleExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Convertimos la hoja a una matriz (arreglo de arreglos)
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Fila 3 es índice 2
        if (data.length < 3) {
          return toast({
            title: "Estructura inválida",
            description: "El archivo no posee suficientes filas para leer encabezados en la fila 3.",
            status: "error",
            duration: 3000,
          });
        }

        const nuevosMiembros: Miembro[] = [];

        // Leer los datos a partir de la fila 4 (índice 3)
        for (let i = 3; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          // Columna 2 es índice 1
          const nombre = row[1] ? String(row[1]).trim() : "";
          const cedula = row[2] ? String(row[2]).trim() : "";
          const telefono = row[3] ? String(row[3]).trim() : "";
          const correo = row[4] ? String(row[4]).trim() : "";
          const coordinacion = row[5] ? String(row[5]).trim() : "";
          const anio = row[6] ? String(row[6]).trim() : "";
          const facultad = row[7] ? String(row[7]).trim() : "";
          const escuela = row[8] ? String(row[8]).trim() : "";

          if (cedula || nombre) {
            nuevosMiembros.push({
              nombre,
              cedula,
              telefono,
              correo,
              coordinacion,
              anio,
              facultad,
              escuela,
              isVerified: Boolean(cedula),
            });
          }
        }

        if (nuevosMiembros.length > 0) {
          setMiembros(nuevosMiembros);
          toast({
            title: "Miembros importados",
            description: `Se han importado ${nuevosMiembros.length} miembros desde el archivo.`,
            status: "success",
            duration: 3000,
          });
        } else {
          toast({
            title: "Sin datos",
            description: "No se encontraron registros de miembros válidos.",
            status: "warning",
            duration: 3000,
          });
        }
      } catch (err) {
        toast({
          title: "Error al procesar",
          description: "No se pudo leer el archivo Excel/CSV.",
          status: "error",
          duration: 3000,
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleMiembroChange = (
    index: number,
    field: MiembroStringField,
    value: string
  ) => {
    const updated = [...miembros];
    updated[index][field] = value;
    setMiembros(updated);
  };

  const handleDocumentoChange = (
    index: number,
    file?: File
  ) => {
    if (!file) return;

    const updated = [...miembros];
    updated[index].documento = file;

    if (file.type === "application/pdf") {
      updated[index].documentoPreview = null;
    } else {
      updated[index].documentoPreview = URL.createObjectURL(file);
    }

    setMiembros(updated);
  };

  const addMiembro = () => {
    setMiembros([
      ...miembros,
      miembroVacio(),
    ]);
  };

  const removeMiembro = (index: number) => {
    if (miembros.length <= 5) return;
    const removedMember = miembros[index];
    
    // Si borramos el que era líder, limpiamos la selección
    if (removedMember.cedula && removedMember.cedula === form.liderCedula) {
      setForm(f => ({ ...f, liderCedula: "" }));
    }

    setMiembros(miembros.filter((_, i) => i !== index));
  };

  const validarMiembros = () => {
    for (let i = 0; i < miembros.length; i++) {
      const m = miembros[i];

      if (
        !m.nombre ||
        !m.cedula ||
        !m.telefono ||
        !m.correo ||
        !m.coordinacion ||
        !m.anio ||
        !m.facultad ||
        !m.escuela ||
        !m.documento
      ) {
        return `El miembro #${i + 1} tiene campos incompletos.`;
      }
    }

    return null;
  };

  // SUBMIT
  const handleSubmit = async () => {
    // Validaciones básicas
    if (!form.nombre || !form.correo || !form.telefono || form.tipo.length === 0 || !form.fechaFundacion || !form.objetivo) {
      return toast({
        title: "Campos faltantes",
        description: "Debe completar todos los campos obligatorios.",
        status: "error",
        duration: 2000,
      });
    }

    if (!form.esMultidisciplinario) {
      if (form.facultad.length === 0 || !form.facultad[0]) {
        return toast({
          title: "Facultad requerida",
          description: "Debe seleccionar la facultad a la que pertenece el grupo.",
          status: "error",
          duration: 2000,
        });
      }
    } else {
      const esNinguna = form.facultad.includes(OPCION_NINGUNA_FACULTAD);
      if (!esNinguna && form.facultad.length < 2) {
        return toast({
          title: "Facultades insuficientes",
          description: "Un grupo multidisciplinario debe seleccionar al menos 2 facultades o indicar que no pertenecen a ninguna.",
          status: "error",
          duration: 3000,
        });
      }
    }

    if (miembrosGuardados.length < 5) {
      return toast({
        title: "Miembros insuficientes",
        description: "Se requiere un mínimo de 5 miembros registrados y guardados para enviar la solicitud.",
        status: "error",
        duration: 4000,
      });
    }

    if (!form.liderCedula) {
      return toast({
        title: "Líder de grupo requerido",
        description: "Debe seleccionar un líder entre los miembros agregados.",
        status: "error",
        duration: 3000,
      });
    }

    if (!logoFile) {
      return toast({
        title: "Logo requerido",
        description: "Debe subir el logo del grupo.",
        status: "error",
        duration: 2000,
      });
    }

    if (!pdfProyecto) {
      return toast({
        title: "Proyecto requerido",
        description: "Debe subir el archivo PDF del proyecto.",
        status: "error",
        duration: 2000,
      });
    }

    if (form.tipo.includes("Otros") && !form.otrosTipo) {
      return toast({
        title: "Debe especificar actividad",
        description: "Indicó 'Otros' en Tipo de Actividades, debe especificar cuál.",
        status: "error",
        duration: 2000,
      });
    }

    setLoading(true);
    const formData = new FormData();

    // 3. Empaquetar los metadatos principales del grupo en la estructura que espera el Backend
    // Adaptamos las claves según lo que suele inferir el struct de Go (puedes ajustar los nombres de las propiedades si tu backend usa nombres específicos)
    formData.append("nombre", form.nombre);
    formData.append("correo", form.correo);
    formData.append("telefono", form.telefono);
    form.tipo.forEach((t) => {
      formData.append("tipo", t);
    });
    formData.append("fundacion", form.fechaFundacion);
    formData.append("es_multidisciplinario", String(form.esMultidisciplinario));
    formData.append("objetivo", form.objetivo);

    let facultadesFinales: string[] = [];
    if (form.esMultidisciplinario) {
      if (form.facultad.includes(OPCION_NINGUNA_FACULTAD)) {
        facultadesFinales = ["DEU"];
      } else {
        facultadesFinales = form.facultad;
      }
    } else {
      facultadesFinales = [form.facultad[0]];
    }

    facultadesFinales.forEach((f) => {
      formData.append("facultad", f);
    });

    const miembrosDTO = miembrosGuardados.map((m) => ({
      nombre: m.nombre,
      cedula: parseInt(m.cedula.replace(/\D/g, ""), 10) || 0,
      telefono: m.telefono,
      correo: m.correo,
      coordinacion: m.coordinacion,
      año: m.anio,
      facultad: m.facultad,
      escuela: m.escuela,
      //documento: m.documento ? m.documento.name : "",
      es_lider: Boolean(m.cedula && m.cedula === form.liderCedula),
      status: true,
    }));

    formData.append("miembros", JSON.stringify(miembrosDTO));

    formData.append("logo", logoFile);
    formData.append("proyecto_grupo", pdfProyecto);

    // 5. Adjuntar los archivos individuales de los miembros de forma correlativa para que el backend pueda asociarlos por índice
    miembrosGuardados.forEach((miembro, index) => {
      if (miembro.documento) {
        formData.append(`documento_miembro_${index}`, miembro.documento);
      }
    });

    try {
      // Realizamos la petición al endpoint respectivo de creación de grupos
      const response = await apiRequest('/groups/requests', { 
        method: 'POST',
        body: formData
      });

      if (response && (response.error || response.status === 500 || response.status === 400)) {
        throw new Error(response.message || "El servidor backend rechazó la petición de creación.");
      }

    toast({
      title: "Solicitud enviada exitosamente",
      description: "El grupo ha sido registrado en estado de revisión.",
      status: "success",
      duration: 5000,
    });

    router.push("/admingroup/dashboard");
  } catch (error: any) {
      toast({ 
        title: "Error al enviar la solicitud", 
        description: error.message || "Ocurrió un error inesperado de comunicación.", 
        status: "error",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Crear Grupo de Extensión</Heading>

      <VStack spacing={5} align="stretch">
        {/* Nombre */}
        <FormControl isRequired>
          <FormLabel>Nombre del Grupo de Extensión</FormLabel>
          <Input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </FormControl>

        {/* Correo */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="ejemplo@gmail.com"
            />
          </FormControl>

          {/* Teléfono de contacto */}
          <FormControl isRequired>
            <FormLabel>Teléfono de Contacto</FormLabel>
            <Input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: 04141234567"
            />
          </FormControl>
        </SimpleGrid>

        {/* Logo */}
        <FormControl isRequired>
          <FormLabel mb={1}>Logo del Grupo (jpg/png/webp)</FormLabel>
          {logoPreview && (
            <Image
              src={logoPreview}
              alt="Logo preview"
              maxH="180px"
              objectFit="contain"
              borderRadius="md"
              mb={3}
            />
          )}
          <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogo} />
        </FormControl>

        {/* Tipo de Grupo */}
        <FormControl  isRequired>
          <FormLabel mb={4}>¿El Grupo es Multidisciplinario?</FormLabel>
          <Checkbox 
            isChecked={form.esMultidisciplinario} 
            onChange={(e) => handleMultidisciplinarioChange(e.target.checked)}
              colorScheme="primary"
          >
            Sí, el grupo involucra múltiples facultades o no esta asociada a ninguna.
          </Checkbox>
        </FormControl>

        {/* Facultad */}
        {!form.esMultidisciplinario ? (        
          <FormControl isRequired>
            <FormLabel>Facultad</FormLabel>
            <Select 
              bg="white"
              value={form.facultad[0] || ""} 
              onChange={(e) => setForm({ ...form, facultad: e.target.value ? [e.target.value] : [] })}
            >
              <option value="">Seleccione...</option>
              {FACULTADES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </FormControl>
        ) : (        
          <FormControl isRequired>
            <FormLabel>Facultad(es)</FormLabel>
            <CheckboxGroup
              value={form.facultad}
              onChange={(val) => handleCheckboxFacultadChange(val as string[])}
            >
              <VStack align="stretch" bg="white" p={3} borderRadius="md" border="1px" borderColor="gray.200">
                <Checkbox value={OPCION_NINGUNA_FACULTAD} colorScheme="primary">
                  <b>{OPCION_NINGUNA_FACULTAD}</b>
                </Checkbox>
                {FACULTADES.map((f) => (
                  <Checkbox key={f} value={f} isDisabled={form.facultad.includes(OPCION_NINGUNA_FACULTAD)}>
                    {f}
                  </Checkbox>
                ))}
              </VStack>
            </CheckboxGroup>
          </FormControl>
        )}

        {/* Fecha fundación */}
        <FormControl isRequired>
          <FormLabel>Fecha de Fundación</FormLabel>
          <Input type="date" name="fechaFundacion" value={form.fechaFundacion} onChange={handleChange} />
        </FormControl>

        {/* Objetivo */}
        <FormControl isRequired>
          <FormLabel>Objetivo del Grupo</FormLabel>
          <Textarea
            name="objetivo"
            value={form.objetivo}
            onChange={handleChange}
            rows={4}
            placeholder="Describe el propósito fundamental del grupo..."
          />
        </FormControl>

        {/* Tipo(s) de actividad(es) */}
        <FormControl isRequired>
          <FormLabel>Tipo(s) de Actividad(es)</FormLabel>
          <CheckboxGroup
            value={form.tipo}
            onChange={(val) => setForm({ ...form, tipo: val as string[] })}
          >
            <VStack align="stretch">
              {TIPOS_ACTIVIDAD.map((a) => (
                <Checkbox key={a} value={a}>
                  {a}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </FormControl>

        {/* Campo OTROS */}
        {form.tipo.includes("Otros") && (
          <FormControl isRequired>
            <FormLabel>Si la opción es otros, especifique</FormLabel>
            <Input
              name="otrosTipo"
              value={form.otrosTipo}
              onChange={handleChange}
              placeholder="Especifique el tipo de actividad"
            />
          </FormControl>
        )}

        {/* Proyecto PDF */}
        <FormControl isRequired>
          <FormLabel>Proyecto del Grupo (PDF)</FormLabel>
          <Input type="file" accept="application/pdf" onChange={handleProyecto} />
        </FormControl>

        {/* Miembros */}
        <Box border="1px" borderColor="gray.100" p={4} borderRadius="md" bg="gray.50">
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Miembros Integrantes del Grupo</FormLabel>

              <Button colorScheme="secondary" onClick={onOpen} width="full">
                ⚙️ Gestionar miembros
              </Button>

              <Text fontSize="xs" color="gray.600" mt={2}>
                Miembros agregados: <b>{miembrosGuardados.length}</b> (Mínimo requerido: 5)
              </Text>
            </FormControl>

            {/* Líder de Grupo */}
            <FormControl isRequired isDisabled={miembrosGuardados.length === 0}>
              <FormLabel>Líder de Grupo</FormLabel>
              <Select 
                bg="white"
                name="liderCedula" 
                placeholder={miembrosGuardados.length === 0 ? "Primero gestione y guarde los miembros" : "Seleccione el líder..."}
                value={form.liderCedula} 
                onChange={handleChange}
              >
                {miembrosGuardados.map((m, idx) => (
                  <option key={m.cedula || idx} value={m.cedula}>
                    {m.nombre ? `${m.nombre} (C.I. ${m.cedula})` : `Miembro sin nombre - ${m.cedula}`}
                  </option>
                ))}
              </Select>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Esta lista se actualizará cada vez que modifiques y guardes los datos en el gestor de arriba.
              </Text>
            </FormControl>
          </VStack>
        </Box>

      {/* VENTANA MODAL PARA MIEMBROS */}
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent maxW="95vw" maxH="90vh" mx="auto" overflowY="auto">
            <ModalHeader>Miembros del Grupo</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box overflowX="auto">
                <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="sm" color="gray.700">
                  <b>*El campo &quot;Año&quot; se refiere al año y semestre que está cursando el estudiante. No confundir con el año actual.</b>
                </Text>
                  
                {/* BOTÓN PARA IMPORTAR EXCEL */}
                <Button as="label" colorScheme="primary" size="sm" cursor="pointer">
                  📁 Importar desde Excel / CSV
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    onChange={handleExcel}
                  />
                </Button>
                </Flex>

                <VStack spacing={4} align="stretch" minW="200px">

                  {/* ENCABEZADOS */}
                  <Grid
                    templateColumns="30px 1.8fr 1fr 1.3fr 1.3fr 1.5fr 1fr 1.5fr 1.5fr 2fr 50px"
                    gap={0}
                    fontWeight="bold"
                    fontSize="sm"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">#</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Cédula</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Nombre</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Teléfono</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Correo</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Coordinación</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Año</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Facultad</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Escuela</Text>
                    <Text p={2} borderColor="gray.200">Documento</Text>
                    <Text p={2} borderColor="gray.200"></Text>
                  </Grid>

                  {/* FILAS */}
                  {miembros.map((miembro, index) => (
                    <Box key={index} borderBottom="1px solid" borderColor="gray.200" py={2}>
                      {!miembro.isVerified ? (
                        /* VISTA INICIAL: SOLO CÉDULA */
                        <Flex gap={4} align="center" bg="secondary.50" p={2} borderRadius="md">
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                          >
                            {index + 1}
                          </Box>
                          <FormControl>
                            <Input
                              bg="white"
                              placeholder="Ingrese Cédula para comenzar"
                              value={miembro.cedula}
                              onChange={(e) => handleMiembroChange(index, "cedula", e.target.value)}
                            />
                          </FormControl>
                          <Button colorScheme="secondary" onClick={() => comprobarCedula(index)}>
                            Comprobar
                          </Button>
                          <Button colorScheme="red" variant="ghost" onClick={() => removeMiembro(index)}>
                            ✕
                          </Button>
                        </Flex>
                      ) : (
                      <Grid
                        templateColumns="30px 1.8fr 1fr 1.3fr 1.3fr 1.5fr 1fr 1.5fr 1.5fr 2fr 50px"
                        gap={0}
                        alignItems="center"
                        borderBottom="1px solid"
                        borderColor="gray.200"
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                        >
                          {index + 1}
                        </Box>
                        <Input
                          placeholder="Cédula"
                          value={miembro.cedula}
                          onChange={(e) =>
                            handleMiembroChange(index, "cedula", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Nombre"
                          value={miembro.nombre}
                          onChange={(e) =>
                            handleMiembroChange(index, "nombre", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Teléfono"
                          value={miembro.telefono}
                          onChange={(e) =>
                            handleMiembroChange(index, "telefono", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Correo"
                          type="email"
                          value={miembro.correo}
                          onChange={(e) =>
                            handleMiembroChange(index, "correo", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Coordinación"
                          value={miembro.coordinacion}
                          onChange={(e) =>
                            handleMiembroChange(index, "coordinacion", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Año"
                          value={miembro.anio}
                          onChange={(e) =>
                            handleMiembroChange(index, "anio", e.target.value)
                          }
                        />
                        <Select
                          placeholder="Facultad"
                          value={miembro.facultad}
                          onChange={(e) => {
                            handleMiembroChange(index, "facultad", e.target.value);
                            handleMiembroChange(index, "escuela", "");
                          }}
                        >
                          {FACULTADES.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </Select>
                        {!miembro.facultad ? (
                          <Select isDisabled placeholder="Seleccione una facultad primero" />
                        ) : (
                          <Select
                            placeholder="Escuela"
                            value={miembro.escuela}
                            onChange={(e) =>
                              handleMiembroChange(index, "escuela", e.target.value)
                            }
                          >
                            {(ESCUELAS_POR_FACULTAD[miembro.facultad] ?? []).map((esc) => (
                              <option key={esc} value={esc}>
                                {esc}
                              </option>
                            ))}
                          </Select>
                        )}
                        <Box>
                          {miembro.documento && (
                            miembro.documento.type === "application/pdf" ? (
                              <Link
                                href={URL.createObjectURL(miembro.documento)}
                                isExternal
                                fontSize="sm"
                                color="secondary.500"
                              >
                                Ver PDF
                              </Link>
                            ) : (
                              <Image
                                src={miembro.documentoPreview ?? ""}
                                alt="Preview"
                                maxH="150px"
                                objectFit="contain"
                                mb={1}
                              />
                            )
                          )}

                          <Input
                            type="file"
                            accept="image/jpeg,application/pdf"
                            size="sm"
                            onChange={(e) =>
                              handleDocumentoChange(index, e.target.files?.[0])
                            }
                          />
                        </Box>

                        {/* BOTÓN ELIMINAR */}
                        <Button
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeMiembro(index)}
                          isDisabled={miembros.length === 1}
                        >
                          ✕
                        </Button>
                      </Grid>
                      )}
                    </Box>
                  ))}

                  <Button
                    alignSelf="flex-start"
                    colorScheme="primary"
                    variant="outline"
                    onClick={addMiembro}
                  >
                    ➕ Agregar miembro
                  </Button>
                </VStack>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="primary"
                onClick={() => {
                  const error = validarMiembros();
                  if (error) {
                    toast({
                      title: "Datos incompletos",
                      description: error,
                      status: "error",
                      duration: 2500,
                    });
                    return;
                  }

                  setMiembrosGuardados([...miembros]);
                  onClose();
                }}
              >
                Guardar y volver
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Observaciones */}
        <FormControl>
          <FormLabel>Observaciones</FormLabel>
          <Textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows={3}
            placeholder="Información adicional relevante..."
          />
        </FormControl>

        {/* Aviso */}
        <Text fontSize="sm" color="gray.700" lineHeight="tall" bg="primary.50/50" p={3} borderRadius="md" borderLeft="3px solid" borderColor="primary.400">
          ℹ️ <strong>Nota institucional:</strong> La creación de un Grupo de Extensión requiere la aprobación tanto de la Dirección de Extensión como de la Facultad correspondiente. Este proceso puede llevar un tiempo.
        </Text>

        {/* Botones */}
        <Flex justify="space-between" mt={4}>
          <Button colorScheme="gray" onClick={() => router.back()}>
            Cancelar
          </Button>

          <Button 
            colorScheme="primary" 
            onClick={handleSubmit} 
            isLoading={loading}
            loadingText="Enviando..."
          >
            Enviar Solicitud
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
