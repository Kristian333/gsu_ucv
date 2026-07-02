"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Radio,
  RadioGroup,
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
  Grid
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";

interface GrupoItem {
  id: number;
  title: string;
  email: string;
  faculty?: string[];
  image?: string;
  objetive?: string;
  actividades?: string[];
  fundation?: string;
  type?: string;
}

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
}

export default function ValidarGrupoForm({ groups }: { groups: GrupoItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const miembroVacio = (): Miembro => ({
    nombre: "",
    cedula: "",
    telefono: "",
    correo: "",
    coordinacion: "",
    anio: "",
    facultad: "",
    escuela: "",
  });

  const [miembros, setMiembros] = useState<Miembro[]>(
    Array.from({ length: 5 }, miembroVacio)
  );

  const [miembrosGuardados, setMiembrosGuardados] = useState<Miembro[]>([]);

  const FACULTADES = [
    "Agronomía",
    "Arquitectura y Urbanismo",
    "Ciencias",
    "Ciencias Económicas y Sociales",
    "Farmacia",
    "Humanidades y Educación",
    "Ingeniería",
    "Ciencias Jurídicas y Políticas",
    "Medicina",
    "Odontología",
    "Ciencias Veterinarias",
  ];

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
    "Ciencias Veterinarias": ["Medicina Veterinaria"],
  };

  // Buscar grupo cuyo title = nombre de usuario
  const grupo = groups.find(
    (g) => g.title.trim().toLowerCase() === user?.name.trim().toLowerCase()
  );
  
  // ESTADOS DEL FORMULARIO
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    tipoGrupo: "",
    facultad: [] as string[],
    fechaFundacion: "",
    objetivo: "",
    actividades: [] as string[],
    otrosActividad: "",
    tipoIntegrantes: [] as string[],
    observaciones: "",
    });


  useEffect(() => {
    if (!grupo) return;

    setForm((prev) => ({
        ...prev,
        nombre: grupo.title ?? "",
        correo: grupo.email ?? "",
        facultad: grupo.faculty ?? [],
        objetivo: grupo.objetive ?? "",
        actividades: grupo.actividades ?? [],
        fechaFundacion: grupo.fundation ?? "",
        tipoGrupo: grupo.type ?? "",
    }));
    setLogoPreview(grupo.image ?? null);
  }, [grupo]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [pdfProyecto, setPdfProyecto] = useState<File | null>(null);
  const [archivoMiembros, setArchivoMiembros] = useState<File | null>(null);

  // FUNCIONES DE CAMBIO
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Hasta que no cargue localStorage no seguimos
  if (!isHydrated) return null;

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleProyecto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfProyecto(file);
  };

  const handleExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setArchivoMiembros(file);
  };

  const handleMiembroChange = (
    index: number,
    field: keyof Miembro,
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
      {
        nombre: "",
        cedula: "",
        telefono: "",
        correo: "",
        coordinacion: "",
        anio: "",
        facultad: "",
        escuela: "",
      },
    ]);
  };

  const removeMiembro = (index: number) => {
    if (miembros.length <= 5) return;
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

  // Si no existe, mensaje
  if (!grupo) {
    return (
      <Box maxW="600px" mx="auto" mt={20} p={10} textAlign="center">
        <Heading size="lg" mb={4}>Grupo no encontrado</Heading>
        <Text>
          No existe un grupo de extensión asociado al usuario <b>{user?.name}</b>.
        </Text>
      </Box>
    );
  }

  // SUBMIT
  const handleSubmit = () => {
    // Validaciones básicas
    if (!form.password || !form.tipoGrupo || !form.fechaFundacion || !form.objetivo) {
      return toast({
        title: "Campos faltantes",
        description: "Debe completar todos los campos obligatorios.",
        status: "error",
        duration: 2000,
      });
    }

    if (!logoFile && !grupo.image) {
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

    console.log("FORMULARIO ENVIADO", form);
    console.log("LOGO:", logoFile);
    console.log("PDF:", pdfProyecto);

    toast({
      title: "Solicitud enviada",
      description: "Simulación completada. Datos en consola.",
      status: "success",
    });

    router.push("/admingroup/dashboard");
  };

  return (
    <Box maxW="800px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Validar Grupo de Extensión</Heading>

      <VStack spacing={6} align="stretch">
        {/* Nombre */}
        <FormControl isRequired>
          <FormLabel>NOMBRE DEL GRUPO DE EXTENSIÓN</FormLabel>
          <Input name="nombre" value={form.nombre} readOnly />
        </FormControl>

        {/* Logo */}
        <FormControl >
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
        </FormControl>

        {/* Contraseña */}
        <FormControl isRequired>
          <FormLabel>CONTRASEÑA</FormLabel>
          <Input type="password" name="password" value={form.password ?? ""} onChange={handleChange} />
        </FormControl>

        {/* Proyecto PDF */}
        <FormControl isRequired>
          <FormLabel>PROYECTO DEL GRUPO (PDF)</FormLabel>
          <Input type="file" accept="application/pdf" onChange={handleProyecto} />
        </FormControl>

        {/* Tipo de integrantes */}
        <FormControl isRequired>
          <FormLabel>TIPO DE INTEGRANTES</FormLabel>
          <CheckboxGroup
            value={form.tipoIntegrantes}
            onChange={(v) => setForm({ ...form, tipoIntegrantes: v as string[] })}
          >
            <VStack align="stretch">
              <Checkbox value="ESTUDIANTES">ESTUDIANTES</Checkbox>
              <Checkbox value="PROFESORES">PROFESORES</Checkbox>
              <Checkbox value="OTROS">OTROS</Checkbox>
            </VStack>
          </CheckboxGroup>
        </FormControl>

        {/* Miembros */}
        <FormControl isRequired>
          <FormLabel>MIEMBROS DEL GRUPO</FormLabel>

          <Button colorScheme="blue" onClick={onOpen}>
            Gestionar miembros
          </Button>

          <Text fontSize="sm" color="gray.600" mt={2}>
            Miembros agregados: {miembrosGuardados.length}
          </Text>

          
        </FormControl>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent maxW="95vw" maxH="90vh"  mx="auto" overflowY="auto">
            <ModalHeader>Miembros del Grupo</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box overflowX="auto">
                <Text fontSize="sm" color="gray.700" mb={2}>
                  <b>*El campo "Año" se refiere al año y semestre que está cursando el estudiante. No confundir con el año actual.</b>
                </Text>

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
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Nombre</Text>
                    <Text p={2} borderRight="1px solid" borderColor="gray.200">Cédula</Text>
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
                    <Grid
                      key={index}
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
                        placeholder="Nombre"
                        value={miembro.nombre}
                        onChange={(e) =>
                          handleMiembroChange(index, "nombre", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Cédula"
                        value={miembro.cedula}
                        onChange={(e) =>
                          handleMiembroChange(index, "cedula", e.target.value)
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
                        onChange={(e) =>{
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
                              color="blue.500"
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
                  ))}

                  <Button
                    alignSelf="flex-start"
                    colorScheme="green"
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
                colorScheme="green"
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
          <FormLabel>OBSERVACIONES</FormLabel>
          <Textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows={4}
          />
        </FormControl>

        {/* Aviso */}
        <Text fontSize="sm" color="gray.700" mt={6}>
          La creación de un Grupo de Extensión requiere la aprobación tanto de la Dirección de Extensión como de la Facultad correspondiente. Este proceso puede llevar un tiempo.
        </Text>

        {/* Botones */}
        <Flex justify="space-between" mt={4}>
          <Button colorScheme="gray" onClick={() => router.back()}>
            Cancelar
          </Button>

          <Button colorScheme="green" onClick={handleSubmit}>
            Enviar Solicitud
          </Button>
        </Flex>

      </VStack>
    </Box>
  );
}
