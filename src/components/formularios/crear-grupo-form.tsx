"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
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

  const [submitted, setSubmitted] = useState(false);

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

  const [miembros, setMiembros] = useState<Miembro[]>(
    Array.from({ length: 5 }, miembroVacio)
  );

  const [miembrosGuardados, setMiembrosGuardados] = useState<Miembro[]>([]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pdfProyecto, setPdfProyecto] = useState<File | null>(null);

  const errors = {
    nombre: submitted && !form.nombre.trim(),
    correo: submitted && !form.correo.trim(),
    telefono: submitted && !form.telefono.trim(),
    facultad:
      submitted &&
      (!form.esMultidisciplinario
        ? form.facultad.length === 0 || !form.facultad[0]
        : !form.facultad.includes(OPCION_NINGUNA_FACULTAD) &&
          form.facultad.length < 2),
    fechaFundacion: submitted && !form.fechaFundacion,
    objetivo: submitted && !form.objetivo.trim(),
    tipo: submitted && form.tipo.length === 0,
    otrosTipo: submitted && form.tipo.includes("Otros") && !form.otrosTipo.trim(),
    logoFile: submitted && !logoFile,
    pdfProyecto: submitted && !pdfProyecto,
    miembrosGuardados: submitted && miembrosGuardados.length < 5,
    liderCedula: submitted && !form.liderCedula,
  };

  const comprobarCedula = (index: number) => {
    const cedulaAChequear = miembros[index].cedula.trim();

    if (!cedulaAChequear) {
      return toast({
        title: "Cédula vacía",
        status: "warning",
        duration: 2000,
      });
    }

    const existe = miembros.some((m, i) => m.cedula === cedulaAChequear && i !== index);

    if (existe) {
      return toast({
        title: "Cédula duplicada",
        description: "Este miembro ya ha sido agregado a la lista.",
        status: "error",
        duration: 3000,
      });
    }

    const updated = [...miembros];
    updated[index].isVerified = true;
    setMiembros(updated);

    toast({
      title: "Cédula válida",
      status: "success",
      duration: 1000,
    });
  };

  const handleMultidisciplinarioChange = (isMulti: boolean) => {
    setForm({
      ...form,
      esMultidisciplinario: isMulti,
      facultad: [],
    });
  };

  const handleCheckboxFacultadChange = (selectedValues: string[]) => {
    const teniaNinguna = form.facultad.includes(OPCION_NINGUNA_FACULTAD);
    const tieneNingunaAhora = selectedValues.includes(OPCION_NINGUNA_FACULTAD);

    if (!teniaNinguna && tieneNingunaAhora) {
      setForm({ ...form, facultad: [OPCION_NINGUNA_FACULTAD] });
    } else if (teniaNinguna && selectedValues.length > 1) {
      setForm({ ...form, facultad: selectedValues.filter((v) => v !== OPCION_NINGUNA_FACULTAD) });
    } else {
      setForm({ ...form, facultad: selectedValues });
    }
  };

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

        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length < 3) {
          return toast({
            title: "Estructura inválida",
            description: "El archivo no posee suficientes filas para leer encabezados en la fila 3.",
            status: "error",
            duration: 3000,
          });
        }

        const nuevosMiembros: Miembro[] = [];

        for (let i = 3; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

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

  const handleDocumentoChange = (index: number, file?: File) => {
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
    setMiembros([...miembros, miembroVacio()]);
  };

  const removeMiembro = (index: number) => {
    if (miembros.length <= 5) return;
    const removedMember = miembros[index];

    if (removedMember.cedula && removedMember.cedula === form.liderCedula) {
      setForm((f) => ({ ...f, liderCedula: "" }));
    }

    setMiembros(miembros.filter((_, i) => i !== index));
  };

  const validarMiembros = () => {
    for (let i = 0; i < miembros.length; i++) {
      const m = miembros[i];

      if (
        !m.nombre.trim() ||
        !m.cedula.trim() ||
        !m.telefono.trim() ||
        !m.correo.trim() ||
        !m.coordinacion.trim() ||
        !m.anio.trim() ||
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
    setSubmitted(true);

    const camposFaltantes: string[] = [];

    if (!form.nombre.trim()) camposFaltantes.push("• Nombre del Grupo");
    if (!form.correo.trim()) camposFaltantes.push("• Correo Electrónico");
    if (!form.telefono.trim()) camposFaltantes.push("• Teléfono de Contacto");
    if (!logoFile) camposFaltantes.push("• Logo del Grupo");

    if (!form.esMultidisciplinario) {
      if (form.facultad.length === 0 || !form.facultad[0]) {
        camposFaltantes.push("• Facultad");
      }
    } else {
      const esNinguna = form.facultad.includes(OPCION_NINGUNA_FACULTAD);
      if (!esNinguna && form.facultad.length < 2) {
        camposFaltantes.push("• Facultad(es) (seleccionar al menos 2 o indicar 'ninguna')");
      }
    }

    if (!form.fechaFundacion) camposFaltantes.push("• Fecha de Fundación");
    if (!form.objetivo.trim()) camposFaltantes.push("• Objetivo del Grupo");
    if (form.tipo.length === 0) camposFaltantes.push("• Tipo(s) de Actividad(es)");
    if (form.tipo.includes("Otros") && !form.otrosTipo.trim()) {
      camposFaltantes.push("• Especificación del tipo de actividad ('Otros')");
    }
    if (!pdfProyecto) camposFaltantes.push("• Proyecto del Grupo (PDF)");
    if (miembrosGuardados.length < 5) {
      camposFaltantes.push("• Información de miembros (mínimo 5 guardados)");
    }
    if (!form.liderCedula) camposFaltantes.push("• Líder de Grupo");

    if (camposFaltantes.length > 0) {
      return toast({
        title: "Campos faltantes",
        description: (
          <Box mt={2}>
            <Text mb={1}>Por favor complete los siguientes campos obligatorios:</Text>
            {camposFaltantes.map((campo, idx) => (
              <Text key={idx} fontSize="sm">
                {campo}
              </Text>
            ))}
          </Box>
        ),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }

    setLoading(true);
    const formData = new FormData();

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
      es_lider: Boolean(m.cedula && m.cedula === form.liderCedula),
      status: true,
    }));

    formData.append("miembros", JSON.stringify(miembrosDTO));

    if (!logoFile || !pdfProyecto) return;
    
    formData.append("logo", logoFile);
    formData.append("proyecto_grupo", pdfProyecto);

    miembrosGuardados.forEach((miembro, index) => {
      if (miembro.documento) {
        formData.append(`documento_miembro_${index}`, miembro.documento);
      }
    });

    try {
      const response = await apiRequest('/groups/requests', { 
        method: 'POST',
        body: formData,
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
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="700px"
      mx="auto"
      mt={10}
      p={8}
      borderRadius="lg"
      bg="white"
      shadow="md"
    >
      <Heading mb={6}>Crear Grupo de Extensión</Heading>

      <VStack spacing={5} align="stretch">
        {/* Nombre */}
        <FormControl isRequired isInvalid={errors.nombre}>
          <FormLabel>Nombre del Grupo de Extensión</FormLabel>
          <Input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
          {errors.nombre && (
            <FormErrorMessage>Este campo es obligatorio.</FormErrorMessage>
          )}
        </FormControl>

        {/* Correo y Teléfono */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {/* Correo */}
          <FormControl isRequired isInvalid={errors.correo}>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="ejemplo@gmail.com"
            />
            {errors.correo && (
              <FormErrorMessage>Ingrese un correo válido.</FormErrorMessage>
            )}
          </FormControl>

          {/* Teléfono de contacto */}
          <FormControl isRequired isInvalid={errors.telefono}>
            <FormLabel>Teléfono de Contacto</FormLabel>
            <Input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: 04141234567"
            />
            {errors.telefono && (
              <FormErrorMessage>Este campo es obligatorio.</FormErrorMessage>
            )}
          </FormControl>
        </SimpleGrid>

        {/* Logo */}
        <FormControl isRequired isInvalid={errors.logoFile}>
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
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleLogo}
          />
          {errors.logoFile && (
            <FormErrorMessage>Debe subir el logo del grupo.</FormErrorMessage>
          )}
        </FormControl>

        {/* Tipo de Grupo */}
        <FormControl isRequired>
          <FormLabel mb={4}>¿El Grupo es Multidisciplinario?</FormLabel>
          <Checkbox
            isChecked={form.esMultidisciplinario}
            onChange={(e) => handleMultidisciplinarioChange(e.target.checked)}
            colorScheme="primary"
          >
            Sí, el grupo involucra múltiples facultades o no está asociada a ninguna.
          </Checkbox>
        </FormControl>

        {/* Facultad */}
        {!form.esMultidisciplinario ? (
          <FormControl isRequired isInvalid={errors.facultad}>
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
            {errors.facultad && (
              <FormErrorMessage>Debe seleccionar una facultad.</FormErrorMessage>
            )}
          </FormControl>
        ) : (
          <FormControl isRequired isInvalid={errors.facultad}>
            <FormLabel>Facultad(es)</FormLabel>
            <CheckboxGroup
              value={form.facultad}
              onChange={(val) => handleCheckboxFacultadChange(val as string[])}
            >
              <VStack align="stretch" bg="white" p={3} borderRadius="md" border="1px" borderColor={errors.facultad ? "red.500" : "gray.200"}>
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
            {errors.facultad && (
              <FormErrorMessage>
                Seleccione al menos 2 facultades o la opción de no pertenecer a ninguna.
              </FormErrorMessage>
            )}
          </FormControl>
        )}

        {/* Fecha fundación */}
        <FormControl isRequired isInvalid={errors.fechaFundacion}>
          <FormLabel>Fecha de Fundación</FormLabel>
          <Input type="date" name="fechaFundacion" value={form.fechaFundacion} onChange={handleChange} />
          {errors.fechaFundacion && (
            <FormErrorMessage>
              Seleccione la fecha de fundación.
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Objetivo */}
        <FormControl isRequired isInvalid={errors.objetivo}>
          <FormLabel>Objetivo del Grupo</FormLabel>
          <Textarea
            name="objetivo"
            value={form.objetivo}
            onChange={handleChange}
            rows={4}
            placeholder="Describe el propósito fundamental del grupo..."
          />
          {errors.objetivo && (
            <FormErrorMessage>El objetivo es requerido.</FormErrorMessage>
          )}
        </FormControl>

        {/* Tipo(s) de actividad(es) */}
        <FormControl isRequired isInvalid={errors.tipo}>
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
          {errors.tipo && (
            <FormErrorMessage>
              Seleccione al menos un tipo de actividad.
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Campo OTROS */}
        {form.tipo.includes("Otros") && (
          <FormControl isRequired isInvalid={errors.otrosTipo}>
            <FormLabel>Si la opción es otros, especifique</FormLabel>
            <Input
              name="otrosTipo"
              value={form.otrosTipo}
              onChange={handleChange}
              placeholder="Especifique el tipo de actividad"
            />
            {errors.otrosTipo && (
              <FormErrorMessage>
                Debe especificar la actividad.
              </FormErrorMessage>
            )}
          </FormControl>
        )}

        {/* Proyecto PDF */}
        <FormControl isRequired isInvalid={errors.pdfProyecto}>
          <FormLabel>Proyecto del Grupo (PDF)</FormLabel>
          <Input type="file" accept="application/pdf" onChange={handleProyecto} />
          {errors.pdfProyecto && (
            <FormErrorMessage>
              Debe adjuntar el proyecto en formato PDF.
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Miembros */}
        <Box border="1px" borderColor={errors.miembrosGuardados ? "red.500" : "gray.100"} p={4} borderRadius="md" bg={errors.miembrosGuardados ? "red.50" : "gray.50"}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={errors.miembrosGuardados}>
              <FormLabel>Miembros Integrantes del Grupo</FormLabel>

              <Button colorScheme={errors.miembrosGuardados ? "red" : "secondary"} variant={errors.miembrosGuardados ? "solid" : "solid"} onClick={onOpen} width="full">
                ⚙️ Gestionar miembros
              </Button>

              {errors.miembrosGuardados && (
                <Text fontSize="xs" color="red.500" fontWeight="bold" mt={2}>
                  Falta información de los miembros (Mínimo 5 guardados).
                </Text>
              )}

              <Text fontSize="xs" color="gray.600" mt={2}>
                Miembros agregados: <b>{miembrosGuardados.length}</b> (Mínimo requerido: 5)
              </Text>
            </FormControl>

            {/* Líder de Grupo */}
            <FormControl isRequired isDisabled={miembrosGuardados.length === 0} isInvalid={errors.liderCedula}>
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
              {errors.liderCedula ? (
                <FormErrorMessage>
                  Debe seleccionar un líder entre los miembros guardados.
                </FormErrorMessage>
              ) : (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Esta lista se actualizará cada vez que modifiques y guardes los datos en el gestor de arriba.
                </Text>
              )}
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
                          <FormControl isInvalid={submitted && !miembro.cedula.trim()}>
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
                            isInvalid={submitted && !miembro.cedula.trim()}
                            placeholder="Cédula"
                            value={miembro.cedula}
                            onChange={(e) =>
                              handleMiembroChange(index, "cedula", e.target.value)
                            }
                          />

                          <Input
                            isInvalid={submitted && !miembro.nombre.trim()}
                            placeholder="Nombre"
                            value={miembro.nombre}
                            onChange={(e) =>
                              handleMiembroChange(index, "nombre", e.target.value)
                            }
                          />

                          <Input
                            isInvalid={submitted && !miembro.telefono.trim()}
                            placeholder="Teléfono"
                            value={miembro.telefono}
                            onChange={(e) =>
                              handleMiembroChange(index, "telefono", e.target.value)
                            }
                          />

                          <Input
                            isInvalid={submitted && !miembro.correo.trim()}
                            placeholder="Correo"
                            type="email"
                            value={miembro.correo}
                            onChange={(e) =>
                              handleMiembroChange(index, "correo", e.target.value)
                            }
                          />

                          <Input
                            isInvalid={submitted && !miembro.coordinacion.trim()}
                            placeholder="Coordinación"
                            value={miembro.coordinacion}
                            onChange={(e) =>
                              handleMiembroChange(index, "coordinacion", e.target.value)
                            }
                          />

                          <Input
                            isInvalid={submitted && !miembro.anio.trim()}
                            placeholder="Año"
                            value={miembro.anio}
                            onChange={(e) =>
                              handleMiembroChange(index, "anio", e.target.value)
                            }
                          />

                          <Select
                            isInvalid={submitted && !miembro.facultad}
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
                              isInvalid={submitted && !miembro.escuela}
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
                            {miembro.documento && (miembro.documento.type === "application/pdf" ? (
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
                              ))}

                            <Input
                              isInvalid={submitted && !miembro.documento}
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
