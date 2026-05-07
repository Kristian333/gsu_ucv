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
  Image
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

export default function ValidarGrupoForm({ groups }: { groups: GrupoItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();

  

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

        {/* Descargar + subir archivo Excel */}
        <Box>
          <Text mb={2}>
            Descargue el archivo <b>"Miembros de la Organización"</b> y rellénelo:
          </Text>
          <Link href="/ESTRUCTURA_ORGANIZATIVA.xlsx" download>
            <Button colorScheme="blue" mb={3}>Descargar Archivo</Button>
          </Link>

          <Text fontSize="sm" color="gray.700" mb={2}>
            El campo "Año" se refiere al año y semestre que está cursando el estudiante. No confundir con el año actual.
          </Text>

          <FormControl>
            <FormLabel>Suba el archivo completado</FormLabel>
            <Input type="file" accept=".xlsx" onChange={handleExcel} />
          </FormControl>
        </Box>

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
