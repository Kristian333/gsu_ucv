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
  Spinner,
  Center,
  Radio,
  RadioGroup,
  Stack,
  HStack,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import * as XLSX from "xlsx";
import { FACULTADES, ESCUELAS_POR_FACULTAD } from "@/constants/facultades";

interface Miembro {
  id?: string | number;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  coordinacion: string;
  anio: string;
  facultad: string;
  escuela: string;
  status: boolean;
  isNew?: boolean;
  isVerified?: boolean;
  documento?: File | null;
  documentoPreview?: string | null;
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

interface CampoConflicto {
  campo: MiembroStringField;
  nombreCampo: string;
  valorAnterior: string;
  valorNuevo: string;
}

interface ConflictoMiembro {
  nombre: string;
  cedula: string;
  index: number;
  conflictos: CampoConflicto[];
}

export default function ValidarGrupoForm() {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isConflictOpen,
    onOpen: onConflictOpen,
    onClose: onConflictClose,
  } = useDisclosure();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [mensajesExcel, setMensajesExcel] = useState<string[]>([]);
  const [conflictosMiembros, setConflictosMiembros] = useState<ConflictoMiembro[]>([]);
  const [respuestasConflictos, setRespuestasConflictos] = useState<Record<string, string>>({});

  const miembroVacio = (): Miembro => ({
    nombre: "",
    cedula: "",
    telefono: "",
    correo: "",
    coordinacion: "",
    anio: "",
    facultad: "",
    escuela: "",
    status: true,
    isNew: true,
    isVerified: false,
  });

  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [miembrosGuardados, setMiembrosGuardados] = useState<Miembro[]>([]);

  const [form, setForm] = useState({
    observaciones: "",
    liderCedula: "",
  });

  const [dataOriginal, setDataOriginal] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    esMultidisciplinario: false,
    facultad: [] as string[],
    fechaFundacion: "",
    objetivo: "",
    tipo: [] as string[],
    otrosTipo: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pdfProyecto, setPdfProyecto] = useState<File | null>(null);

  const groupId = user?.groupId || user?.group;

  const fetchGrupoData = useCallback(async () => {
    if (!groupId) return;

    try {
      setIsLoading(true);
      const res = await apiRequest(`/groups/${groupId}`, { method: "GET" });
      const data = res.data || res;

      const esMulti = Boolean(data.es_multidisciplinario || data.esMultidisciplinario);
      let facultadesForm: string[] = [];
      if (Array.isArray(data.facultad)) {
        facultadesForm = data.facultad;
      } else if (typeof data.facultad === "string") {
        facultadesForm = [data.facultad];
      }

      // Preservar data intacta
      setDataOriginal({
        nombre: data.nombre || "",
        correo: data.email || data.correo || "",
        telefono: data.telefono || "",
        esMultidisciplinario: esMulti,
        facultad: facultadesForm,
        objetivo: data.objetivo || "",
        tipo: data.tipo || data.actividades || [],
        otrosTipo: data.otrosTipo || "",
        fechaFundacion: data.fundation || data.fechaFundacion || "",
      });

      setForm({
        observaciones: data.observaciones || "",
        liderCedula: data.liderCedula || "",
      });

      if (data.image || data.logo) {
        setLogoPreview(data.image || data.logo);
      }

      if (Array.isArray(data.miembros)) {
        const miembrosCargados: Miembro[] = data.miembros.map((m: any) => ({
          id: m.id,
          nombre: m.nombre || "",
          cedula: String(m.cedula || "").trim(),
          telefono: m.telefono || "",
          correo: m.correo || "",
          coordinacion: m.coordinacion || "",
          anio: m.año || m.anio || "",
          facultad: m.facultad || "",
          escuela: m.escuela || "",
          status: m.status !== undefined ? Boolean(m.status) : true,
          isNew: false,
          isVerified: true,
        }));

        setMiembros(miembrosCargados);
        setMiembrosGuardados(miembrosCargados);

        const liderFound = miembrosCargados.find(
          (m: any) => m.es_lider || (m.cedula === data.liderCedula && m.status)
        );

        if (liderFound && liderFound.status) {
          setForm((f) => ({ ...f, liderCedula: liderFound.cedula }));
        } else {
          setForm((f) => ({ ...f, liderCedula: "" }));
        }
      }
    } catch (error) {
      toast({
        title: "Error al obtener datos",
        description: "No se pudieron cargar los datos del grupo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [groupId, toast]);

  useEffect(() => {
    if (isHydrated && groupId) {
      fetchGrupoData();
    } else if (isHydrated && !groupId) {
      setIsLoading(false);
    }
  }, [isHydrated, groupId, fetchGrupoData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProyecto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfProyecto(file);
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

    const existe = miembros.some(
      (m, i) => m.cedula === cedulaAChequear && i !== index
    );

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

  const handleMiembroChange = (
    index: number,
    field: MiembroStringField,
    value: string
  ) => {
    const updated = [...miembros];
    updated[index][field] = value;
    setMiembros(updated);
  };

  const handleStatusChange = (index: number, newStatus: boolean) => {
    const updated = [...miembros];
    updated[index].status = newStatus;

    if (!newStatus && updated[index].cedula === form.liderCedula) {
      setForm((f) => ({ ...f, liderCedula: "" }));
      toast({
        title: "Líder deshabilitado",
        description: "El miembro seleccionado como líder pasó a estar inactivo. Seleccione un nuevo líder activo.",
        status: "warning",
        duration: 3000,
      });
    }

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
    const removedMember = miembros[index];

    if (removedMember.cedula && removedMember.cedula === form.liderCedula) {
      setForm((f) => ({ ...f, liderCedula: "" }));
    }

    setMiembros(miembros.filter((_, i) => i !== index));
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
            description: "El archivo no posee suficientes filas.",
            status: "error",
            duration: 3000,
          });
        }

        const excelMap = new Map<string, Miembro>();

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

          if (cedula) {
            excelMap.set(cedula, {
              nombre,
              cedula,
              telefono,
              correo,
              coordinacion,
              anio,
              facultad,
              escuela,
              status: true,
              isVerified: true,
            });
          }
        }

        const logs: string[] = [];
        const conflictosTemp: ConflictoMiembro[] = [];
        const listaActualizada: Miembro[] = [...miembros];

        listaActualizada.forEach((m, idx) => {
          if (!m.cedula) return;

          const enExcel = excelMap.get(m.cedula);

          if (enExcel) {
            if (!m.status) {
              m.status = true;
              logs.push(
                `El miembro ${m.nombre || m.cedula} estaba inactivo, está listado en el excel, así que pasa a estar activo.`
              );
            }

            const camposAComparar: { key: MiembroStringField; label: string }[] = [
              { key: "nombre", label: "Nombre" },
              { key: "telefono", label: "Teléfono" },
              { key: "correo", label: "Correo" },
              { key: "coordinacion", label: "Coordinación" },
              { key: "anio", label: "Año" },
              { key: "facultad", label: "Facultad" },
              { key: "escuela", label: "Escuela" },
            ];

            const diffs: CampoConflicto[] = [];

            camposAComparar.forEach(({ key, label }) => {
              const valAnt = m[key] || "";
              const valNue = enExcel[key] || "";
              if (valNue && valAnt !== valNue) {
                diffs.push({
                  campo: key,
                  nombreCampo: label,
                  valorAnterior: valAnt,
                  valorNuevo: valNue,
                });
              }
            });

            if (diffs.length > 0) {
              conflictosTemp.push({
                nombre: m.nombre || `C.I. ${m.cedula}`,
                cedula: m.cedula,
                index: idx,
                conflictos: diffs,
              });
            }

            excelMap.delete(m.cedula);
          } else {
            if (m.status && !m.isNew) {
              m.status = false;
              logs.push(
                `${m.nombre || m.cedula} no estaba listado en el Excel, pasa a ser miembro inactivo.`
              );
            }
          }
        });

        excelMap.forEach((nuevo) => {
          listaActualizada.push({ ...nuevo, isNew: true });
          logs.push(`¡Nuevo miembro ${nuevo.nombre || nuevo.cedula} agregado desde Excel!`);
        });

        const liderActual = listaActualizada.find((m) => m.cedula === form.liderCedula);
        if (liderActual && !liderActual.status) {
          setForm((f) => ({ ...f, liderCedula: "" }));
          toast({
            title: "Líder inhabilitado",
            description: "El líder seleccionado pasó a estar inactivo, debe seleccionar un nuevo líder activo.",
            status: "warning",
            duration: 4000,
          });
        }

        setMiembros(listaActualizada);
        setMensajesExcel(logs);

        const respIniciales: Record<string, string> = {};
        conflictosTemp.forEach((c) => {
          c.conflictos.forEach((conf) => {
            respIniciales[`${c.cedula}_${conf.campo}`] = conf.valorNuevo;
          });
        });
        setRespuestasConflictos(respIniciales);
        setConflictosMiembros(conflictosTemp);

        if (logs.length > 0 || conflictosTemp.length > 0) {
          onConflictOpen();
        } else {
          toast({
            title: "Excel procesado",
            description: "No se hallaron discrepancias.",
            status: "info",
            duration: 3000,
          });
        }
      } catch (err) {
        toast({
          title: "Error al procesar",
          description: "No se pudo interpretar el archivo Excel.",
          status: "error",
          duration: 3000,
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const aplicarResolucionConflictos = () => {
    const updated = [...miembros];

    conflictosMiembros.forEach((conflicto) => {
      const idx = conflicto.index;
      conflicto.conflictos.forEach((conf) => {
        const keyDecision = `${conflicto.cedula}_${conf.campo}`;
        const valorElegido = respuestasConflictos[keyDecision];
        if (valorElegido !== undefined) {
          updated[idx][conf.campo] = valorElegido;
        }
      });
    });

    setMiembros(updated);
    onConflictClose();
    toast({
      title: "Cambios aplicados",
      description: "Se han actualizado los datos según su selección.",
      status: "success",
      duration: 3000,
    });
  };

  const validarMiembros = () => {
    const activos = miembros.filter((m) => m.status);
    for (let i = 0; i < activos.length; i++) {
      const m = activos[i];
      if (
        !m.nombre ||
        !m.cedula ||
        !m.telefono ||
        !m.correo ||
        !m.coordinacion ||
        !m.anio ||
        !m.facultad ||
        !m.escuela
      ) {
        return `El miembro activo #${i + 1} (${m.nombre || m.cedula}) tiene campos incompletos.`;
      }
    }
    return null;
  };

  // SUBMIT
  const handleSubmit = async () => {
    const miembrosActivos = miembrosGuardados.filter((m) => m.status);
    if (miembrosActivos.length < 5) {
      return toast({
        title: "Miembros activos insuficientes",
        description: "Se requiere un mínimo de 5 miembros activos guardados.",
        status: "error",
        duration: 3000,
      });
    }

    if (!form.liderCedula) {
      return toast({
        title: "Líder de grupo requerido",
        description: "Debe seleccionar un líder activo entre los miembros.",
        status: "error",
        duration: 3000,
      });
    }

    if (!pdfProyecto) {
      return toast({
        title: "Proyecto requerido",
        description: "Debe subir el archivo PDF del proyecto.",
        status: "error",
        duration: 2500,
      });
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append("nombre", dataOriginal.nombre);
      formData.append("correo", dataOriginal.correo);
      formData.append("telefono", dataOriginal.telefono);
      formData.append("es_multidisciplinario", String(dataOriginal.esMultidisciplinario));
      formData.append("objetivo", dataOriginal.objetivo);
      
      dataOriginal.facultad.forEach((f) => formData.append("facultad", f));
      dataOriginal.tipo.forEach((t) => formData.append("tipo", t));

      formData.append("observaciones", form.observaciones);

      const miembrosDTO = miembrosGuardados.map((m) => ({
        id: m.id,
        nombre: m.nombre,
        cedula: parseInt(m.cedula.replace(/\D/g, ""), 10) || 0,
        telefono: m.telefono,
        correo: m.correo,
        coordinacion: m.coordinacion,
        año: m.anio,
        facultad: m.facultad,
        escuela: m.escuela,
        status: m.status,
        es_lider: Boolean(m.status && m.cedula === form.liderCedula),
      }));

      formData.append("miembros", JSON.stringify(miembrosDTO));
      formData.append("proyecto_grupo", pdfProyecto);

      miembrosGuardados.forEach((m, index) => {
        if (m.documento) {
          formData.append(`documento_miembro_${index}`, m.documento);
        }
      });

      await apiRequest(`/groups/${groupId}/`, {
        method: "PUT",
        body: formData,
      });

      toast({
        title: "Solicitud de validación enviada",
        description: "La información ha sido actualizada correctamente.",
        status: "success",
        duration: 3000,
      });

      router.push("/admingroup/dashboard");
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message || "Ocurrió un problema al enviar la actualización.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <Center mt={20}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!groupId) {
    return (
      <Box
        maxW="600px"
        mx="auto"
        mt={20}
        p={10}
        textAlign="center"
        bg="white"
        borderRadius="lg"
        shadow="md"
      >
        <Heading size="lg" mb={4}>
          Grupo no asignado
        </Heading>
        <Text>
          El usuario <b>{user?.name}</b> no posee un ID de grupo asociado.
        </Text>
      </Box>
    );
  }

  const miembrosVisibles = miembros.filter((m) => (mostrarInactivos ? true : m.status));

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Validar Grupo de Extensión</Heading>

      <VStack spacing={5} align="stretch">
        {/* Nombre y Logo como elementos decorativos incrustados (sin FormControl ni Input) */}
        <HStack spacing={4} align="center" pb={2}>
          {logoPreview && (
            <Image
              src={logoPreview}
              alt="Logo del Grupo"
              boxSize="70px"
              objectFit="cover"
              borderRadius="md"
            />
          )}
          <Box>
            <Heading size="md">{dataOriginal.nombre || "Sin Nombre Registrado"}</Heading>
          </Box>
        </HStack>

        {/* Proyecto PDF */}
        <FormControl isRequired>
          <FormLabel>Proyecto del Grupo (PDF)</FormLabel>
          <Input
            type="file"
            accept="application/pdf"
            onChange={handleProyecto}
          />
        </FormControl>

        {/* Miembros */}
        <Box
          border="1px"
          borderColor="gray.100"
          p={4}
          borderRadius="md"
          bg="gray.50"
        >
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Miembros del Grupo</FormLabel>

              <Button colorScheme="secondary" onClick={onOpen} width="full">
                ⚙️ Gestionar miembros
              </Button>

              <Text fontSize="xs" color="gray.600" mt={2}>
                Miembros activos agregados:{" "}
                <b>{miembrosGuardados.filter((m) => m.status).length}</b> (Mínimo requerido: 5)
              </Text>
            </FormControl>

            {/* Líder de Grupo: Solo miembros activos */}
            <FormControl
              isRequired
              isDisabled={
                miembrosGuardados.filter((m) => m.status).length === 0
              }
            >
              <FormLabel>Líder de Grupo</FormLabel>
              <Select
                bg="white"
                name="liderCedula"
                placeholder={
                  miembrosGuardados.filter((m) => m.status).length === 0
                    ? "Primero gestione y guarde miembros activos"
                    : "Seleccione el líder..."
                }
                value={form.liderCedula}
                onChange={handleChange}
              >
                {miembrosGuardados
                  .filter((m) => m.status)
                  .map((m, idx) => (
                    <option key={m.cedula || idx} value={m.cedula}>
                      {m.nombre
                        ? `${m.nombre} (C.I. ${m.cedula})`
                        : `Miembro sin nombre - ${m.cedula}`}
                    </option>
                  ))}
              </Select>
            </FormControl>
          </VStack>
        </Box>

        {/* MODAL DE MIEMBROS */}
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent maxW="95vw" maxH="90vh" mx="auto" overflowY="auto">
            <ModalHeader>Miembros del Grupo</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box overflowX="auto">
                <Flex
                  justify="space-between"
                  align="center"
                  mb={4}
                  flexWrap="wrap"
                  gap={3}
                >
                  <Text fontSize="sm" color="gray.700">
                    <b>
                      *El campo &quot;Año&quot; se refiere al año y semestre que está cursando el estudiante. No confundir con el año actual.
                    </b>
                  </Text>

                  <Flex align="center" gap={4}>
                    <Checkbox
                      isChecked={mostrarInactivos}
                      onChange={(e) => setMostrarInactivos(e.target.checked)}
                      colorScheme="red"
                    >
                      <b>Mostrar Miembros Inactivos</b>
                    </Checkbox>

                    <Button
                      as="label"
                      colorScheme="primary"
                      size="sm"
                      cursor="pointer"
                    >
                      📁 Importar desde Excel / CSV
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        hidden
                        onChange={handleExcel}
                      />
                    </Button>
                  </Flex>
                </Flex>

                <VStack spacing={4} align="stretch" minW="1100px">

                  {/* ENCABEZADOS */}
                  <Grid
                    templateColumns="30px 1.8fr 1fr 1.3fr 1.3fr 1.5fr 1fr 1.5fr 1.5fr 2fr 110px"
                    gap={0}
                    fontWeight="bold"
                    fontSize="sm"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      #
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Cédula
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Nombre
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Teléfono
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Correo
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Coordinación
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Año
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Facultad
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Escuela
                    </Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">
                      Documento
                    </Text>
                    <Text p={2} textAlign="center">
                      Estado / Acción
                    </Text>
                  </Grid>

                  {/* FILAS */}
                  {miembrosVisibles.map((miembro) => {
                    const originalIndex = miembros.findIndex(
                      (m) => m === miembro
                    );

                    return (
                      <Box
                        key={originalIndex}
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        py={2}
                        bg={!miembro.status ? "red.50" : "transparent"}
                      >
                        {!miembro.isVerified ? (
                          <Flex
                            gap={4}
                            align="center"
                            bg="secondary.50"
                            p={2}
                            borderRadius="md"
                          >
                            <Box fontWeight="bold">{originalIndex + 1}</Box>
                            <FormControl>
                              <Input
                                bg="white"
                                placeholder="Ingrese Cédula para comenzar"
                                value={miembro.cedula}
                                onChange={(e) =>
                                  handleMiembroChange(
                                    originalIndex,
                                    "cedula",
                                    e.target.value
                                  )
                                }
                              />
                            </FormControl>
                            <Button
                              colorScheme="secondary"
                              onClick={() => comprobarCedula(originalIndex)}
                            >
                              Comprobar
                            </Button>
                            <Button
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeMiembro(originalIndex)}
                            >
                              ✕
                            </Button>
                          </Flex>
                        ) : (
                          <Grid
                            templateColumns="30px 1.8fr 1fr 1.3fr 1.3fr 1.5fr 1fr 1.5fr 1.5fr 2fr 110px"
                            gap={0}
                            alignItems="center"
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontWeight="bold"
                            >
                              {originalIndex + 1}
                            </Box>
                            <Input
                              placeholder="Cédula"
                              value={miembro.cedula}
                              onChange={(e) =>
                                handleMiembroChange(
                                  originalIndex,
                                  "cedula",
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="Nombre"
                              value={miembro.nombre}
                              onChange={(e) =>
                                handleMiembroChange(
                                  originalIndex,
                                  "nombre",
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="Teléfono"
                              value={miembro.telefono}
                              onChange={(e) =>
                                handleMiembroChange(
                                  originalIndex,
                                  "telefono",
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="Correo"
                              type="email"
                              value={miembro.correo}
                              onChange={(e) =>
                                handleMiembroChange(
                                  originalIndex,
                                  "correo",
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="Coordinación"
                              value={miembro.coordinacion}
                              onChange={(e) =>
                                handleMiembroChange(
                                  originalIndex,
                                  "coordinacion",
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="Año"
                              value={miembro.anio}
                              onChange={(e) =>
                                handleMiembroChange(
                                  originalIndex,
                                  "anio",
                                  e.target.value
                                )
                              }
                            />
                            <Select
                              placeholder="Facultad"
                              value={miembro.facultad}
                              onChange={(e) => {
                                handleMiembroChange(
                                  originalIndex,
                                  "facultad",
                                  e.target.value
                                );
                                handleMiembroChange(originalIndex, "escuela", "");
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
                                  handleMiembroChange(
                                    originalIndex,
                                    "escuela",
                                    e.target.value
                                  )
                                }
                              >
                                {(ESCUELAS_POR_FACULTAD[miembro.facultad] ?? []).map((esc) => (
                                  <option key={esc} value={esc}>
                                    {esc}
                                  </option>
                                ))}
                              </Select>
                            )}
                            <Box px={1}>
                              {miembro.documento &&
                                (miembro.documento.type === "application/pdf" ? (
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
                                type="file"
                                accept="image/jpeg,application/pdf"
                                size="sm"
                                onChange={(e) =>
                                  handleDocumentoChange(
                                    originalIndex,
                                    e.target.files?.[0]
                                  )
                                }
                              />
                            </Box>

                            {/* Columna Estado / Eliminación */}
                            <Center px={1}>
                              {miembro.isNew ? (
                                <Button
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => removeMiembro(originalIndex)}
                                >
                                  ✕
                                </Button>
                              ) : (
                                <Select
                                  size="sm"
                                  value={miembro.status ? "activo" : "inactivo"}
                                  bg={miembro.status ? "green.50" : "red.50"}
                                  borderColor={miembro.status ? "green.300" : "red.300"}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      originalIndex,
                                      e.target.value === "activo"
                                    )
                                  }
                                >
                                  <option value="activo">Activo</option>
                                  <option value="inactivo">Inactivo</option>
                                </Select>
                              )}
                            </Center>
                          </Grid>
                        )}
                      </Box>
                    );
                  })}

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

        {/* MODAL DE CAMBIOS / DISCREPANCIAS EN EXCEL */}
        <Modal
          isOpen={isConflictOpen}
          onClose={onConflictClose}
          size="xl"
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Resumen de cambios de importación</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {/* Bitácora de Novedades */}
              {mensajesExcel.length > 0 && (
                <Box mb={6}>
                  <Heading size="xs" mb={2} color="gray.600">
                    NOVEDADES ENCONTRADAS
                  </Heading>
                  <VStack align="stretch" spacing={2}>
                    {mensajesExcel.map((msg, i) => (
                      <Text
                        key={i}
                        fontSize="sm"
                        p={2}
                        bg="gray.50"
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderColor="blue.400"
                      >
                        {msg}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Conflictos y Discrepancias de Campos */}
              {conflictosMiembros.length > 0 && (
                <Box>
                  <Heading size="xs" mb={3} color="gray.600">
                    RESOLUCIÓN DE DISCREPANCIAS
                  </Heading>

                  <VStack spacing={5} align="stretch">
                    {conflictosMiembros.map((conflicto) => (
                      <Box
                        key={conflicto.cedula}
                        p={3}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                      >
                        <Text fontWeight="bold" mb={2}>
                          El miembro {conflicto.nombre} (C.I. {conflicto.cedula})
                          presenta cambios en el/los campos:
                        </Text>

                        {conflicto.conflictos.map((c) => {
                          const keyDecision = `${conflicto.cedula}_${c.campo}`;
                          return (
                            <Box key={c.campo} my={2} pl={2}>
                              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                {c.nombreCampo}:
                              </Text>

                              <RadioGroup
                                value={respuestasConflictos[keyDecision] || ""}
                                onChange={(val) =>
                                  setRespuestasConflictos((prev) => ({
                                    ...prev,
                                    [keyDecision]: val,
                                  }))
                                }
                              >
                                <Stack direction="column" mt={1}>
                                  <Radio value={c.valorAnterior}>
                                    <Text fontSize="sm">
                                      Valor anterior: <b>{c.valorAnterior || "(Vacío)"}</b>
                                    </Text>
                                  </Radio>
                                  <Radio value={c.valorNuevo}>
                                    <Text fontSize="sm">
                                      Valor nuevo (Excel): <b>{c.valorNuevo}</b>
                                    </Text>
                                  </Radio>
                                </Stack>
                              </RadioGroup>
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="primary" onClick={aplicarResolucionConflictos}>
                Confirmar y Aplicar
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

        {/* Botones */}
        <Flex justify="space-between" mt={4}>
          <Button colorScheme="gray" onClick={() => router.back()} isDisabled={isSubmitting}>
            Cancelar
          </Button>

          <Button
            colorScheme="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enviando..."
          >
            Enviar Solicitud
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
