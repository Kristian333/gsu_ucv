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
import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function CrearGrupoForm() {
  const router = useRouter();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

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
    "Veterinaria",
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
    Veterinaria: ["Medicina Veterinaria"],
  };

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [pdfProyecto, setPdfProyecto] = useState<File | null>(null);
  const [archivoMiembros, setArchivoMiembros] = useState<File | null>(null);

  // FUNCIONES DE CAMBIO
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    if (!file) return;
    setArchivoMiembros(file);
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

  // SUBMIT
  const handleSubmit = () => {
    // Validaciones básicas
    if (!form.nombre || !form.correo || !form.tipoGrupo || !form.fechaFundacion || !form.objetivo) {
      return toast({
        title: "Campos faltantes",
        description: "Debe completar todos los campos obligatorios.",
        status: "error",
        duration: 2000,
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

    if (form.actividades.includes("OTROS") && !form.otrosActividad) {
      return toast({
        title: "Debe especificar actividad",
        description: "Indicó 'OTROS', debe especificar cuál.",
        status: "error",
        duration: 2000,
      });
    }

    if (miembros.some(m => !m.nombre || !m.cedula || !m.correo)) {
      return toast({
        title: "Datos incompletos",
        description: "Todos los miembros deben tener al menos nombre, cédula y correo.",
        status: "error",
        duration: 2000,
      });
    }

    console.log("DATOS DEL GRUPO (mock)", form);
    console.log("Logo:", logoFile);
    console.log("Proyecto PDF:", pdfProyecto);
    console.log("Archivo Miembros:", archivoMiembros);

    toast({
      title: "Solicitud enviada",
      description: "Esto es una simulación. Los datos se imprimirán en consola.",
      status: "success",
      duration: 2500,
    });

    router.push("/admingroup/dashboard");
  };

  return (
    <Box maxW="1800px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Crear Grupo de Extensión</Heading>

      <VStack spacing={6} align="stretch">
        {/* Nombre */}
        <FormControl isRequired>
          <FormLabel>NOMBRE DEL GRUPO DE EXTENSIÓN</FormLabel>
          <Input name="nombre" value={form.nombre} onChange={handleChange} />
        </FormControl>

        {/* Correo */}
        <FormControl isRequired>
          <FormLabel>CORREO ELECTRÓNICO</FormLabel>
          <Input type="email" name="correo" value={form.correo} onChange={handleChange} />
        </FormControl>

        {/* Contraseña */}
        <FormControl isRequired>
          <FormLabel>CONTRASEÑA</FormLabel>
          <Input type="password" name="password" value={form.password ?? ""} onChange={handleChange} />
        </FormControl>

        {/* Logo */}
        <FormControl isRequired>
          <FormLabel>LOGO (jpg)</FormLabel>
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
          <Input type="file" accept="image/jpeg" onChange={handleLogo} />
        </FormControl>

        {/* Tipo de Grupo */}
        <FormControl isRequired>
          <FormLabel>TIPO DE GRUPO</FormLabel>
          <RadioGroup name="tipoGrupo" value={form.tipoGrupo} onChange={(val) => setForm({ ...form, tipoGrupo: val })}>
            <VStack align="start">
              <Radio value="MULTIDISCIPLINARIO">MULTIDISCIPLINARIO</Radio>
              <Radio value="MISMA FACULTAD">PERTENECEN A UNA MISMA FACULTAD</Radio>
            </VStack>
          </RadioGroup>
        </FormControl>

        {/* Facultad */}
        {form.tipoGrupo === "MISMA FACULTAD" && (        
            <FormControl isRequired>
            <FormLabel>FACULTAD</FormLabel>
            <Select name="facultad" value={form.facultad} onChange={handleChange}>
                <option value="">Seleccione...</option>
                {[
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
                "Veterinaria",
                ].map((f) => (
                <option key={f} value={f}>
                    {f}
                </option>
                ))}
            </Select>
            </FormControl>
        )}
        {form.tipoGrupo === "MULTIDISCIPLINARIO" && (        
            <FormControl isRequired>
            <FormLabel>FACULTAD</FormLabel>
            <CheckboxGroup
            value={form.facultad}
            onChange={(val) => setForm({ ...form, facultad: val as string[] })}
          >
            <VStack align="stretch">
              {[
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
                "Veterinaria",
              ].map((a) => (
                <Checkbox key={a} value={a}>
                  {a}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
            </FormControl>
        )}

        {/* Fecha fundación */}
        <FormControl isRequired>
          <FormLabel>FECHA DE FUNDACIÓN</FormLabel>
          <Input type="date" name="fechaFundacion" value={form.fechaFundacion} onChange={handleChange} />
        </FormControl>

        {/* Objetivo */}
        <FormControl isRequired>
          <FormLabel>OBJETIVO DEL GRUPO</FormLabel>
          <Textarea name="objetivo" value={form.objetivo} onChange={handleChange} rows={5} />
        </FormControl>

        {/* Tipo(s) de actividad(es) */}
        <FormControl isRequired>
          <FormLabel>TIPO(S) DE ACTIVIDAD(ES)</FormLabel>
          <CheckboxGroup
            value={form.actividades}
            onChange={(val) => setForm({ ...form, actividades: val as string[] })}
          >
            <VStack align="stretch">
              {[
                "SALUD",
                "ACCIÓN SOCIAL",
                "CULTURAL",
                "DEPORTIVA",
                "AMBIENTE / CONSERVACIÓN",
                "INVESTIGACIÓN",
                "RECREACIÓN",
                "DEBATE",
                "OTROS",
              ].map((a) => (
                <Checkbox key={a} value={a}>
                  {a}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </FormControl>

        {/* Campo OTROS */}
        {form.actividades.includes("OTROS") && (
          <FormControl isRequired>
            <FormLabel>SI LA OPCIÓN ES OTROS, ESPECIFIQUE</FormLabel>
            <Input
              name="otrosActividad"
              value={form.otrosActividad}
              onChange={handleChange}
              placeholder="Especifique actividad"
            />
          </FormControl>
        )}

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
