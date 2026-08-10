"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  Textarea,
  FormLabel,
  FormControl,
  Button,
  FormHelperText,
  Image,
  useToast,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";
import { validateGroupAccess } from "@/utils/auth-guards";
import { getActivityStatus, formatActivityDateRange } from "@/utils/common";

interface ReporteFormProps {
  id: string;
}

export default function ReporteClientPage({ id }: ReporteFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();

  const [loadingActividad, setLoadingActividad] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [permisoConcedido, setPermisoConcedido] = useState(false);

  const [actividadBase, setActividadBase] = useState({
    nombre: "",
    ubicacion: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
    area_conocimiento: "",
    financiamiento: "",
    group_id: "",
  });

  const [numMembers, setNumMembers] = useState<number | "">("");
  const [allies, setAllies] = useState<string>("");
  const [expectedBeneficiaries, setExpectedBeneficiaries] = useState<number | "">("");
  const [actualBeneficiaries, setActualBeneficiaries] = useState<number | "">("");
  const [galleryUrl, setGalleryUrl] = useState<string>("");
  const [attendeeFile, setAttendeeFile] = useState<File | null>(null);
  const [observations, setObservations] = useState<string>("");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    if (!id) {
      setErrorCarga("No se recibió el identificador de la actividad.");
      setLoadingActividad(false);
      return;
    }

    const obtenerDatosDeBD = async () => {
      try {
        const data = await apiRequest(`activities/${id}`, { method: "GET" });

        if (data && !data.error) {
          const { hasAccess, reason } = validateGroupAccess(data, user);

          if (!hasAccess) {
            toast({
              title: "Acceso denegado",
              description: reason || "No tienes permisos para esta actividad.",
              status: "error",
              duration: 4000,
              isClosable: true,
              position: "top"
            });
            router.push("/admingroup/nuestras_actividades");
            return;
          }

          const statusInfo = getActivityStatus(data);

          if (statusInfo.label !== "A la Espera de Reporte") {
            toast({
              title: "Reporte inhabilitado",
              description:
                statusInfo.label === "Actividad Futura" || statusInfo.label === "Actividad En Curso"
                  ? "Solo se pueden enviar reportes de actividades que ya hayan finalizado."
                  : "Esta actividad ya cuenta con un reporte registrado.",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top"
            });
            router.push("/admingroup/nuestras_actividades");
            return;
          }

          const grupoActividad = data.group_id ?? data.groupId;

          setActividadBase({
            nombre: data.nombre || "",
            ubicacion: data.ubicacion || "",
            fecha_inicio: data.fecha_inicio || "",
            fecha_fin: data.fecha_fin || "",
            descripcion: data.descripcion || "",
            area_conocimiento: data.area_conocimiento || "",
            financiamiento: data.financiamiento || "",
            group_id: String(grupoActividad),
          });

          setPreviewImage(data.reporte_url || data.reporte || null);

          setNumMembers(data.participantes_grupo || "");
          setAllies(data.aliados || "");
          setExpectedBeneficiaries(data.participantes_estimados || "");
          setActualBeneficiaries(data.participantes_reales || "");
          setGalleryUrl(data.galeria_url || "");
          setObservations(data.observaciones || "");
          
          setPermisoConcedido(true);
        } else {
          throw new Error("La actividad solicitada no existe en el sistema.");
        }
      } catch (err: any) {
        setErrorCarga(err.message || "Error al conectar con el servidor.");
      } finally {
        setLoadingActividad(false);
      }
    };

    obtenerDatosDeBD();
  }, [id, user, isHydrated, router, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  if (!isHydrated || loadingActividad || !permisoConcedido) {
    return (
      <Center h="70vh" flexDirection="column" gap={4}>
        <Spinner size="xl" color="primary.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">
          Verificando permisos y estado del reporte...
        </Text>
      </Center>
    );
  }

  if (errorCarga) {
    return (
      <Center h="70vh">
        <Box p={6} textAlign="center" borderRadius="lg" bg="red.50" color="red.600" shadow="sm" maxW="450px">
          <Heading size="md" mb={2}>Error de Entrada</Heading>
          <Text mb={4}>{errorCarga}</Text>
          <Button colorScheme="red" variant="outline" onClick={() => router.back()}>Volver atrás</Button>
        </Box>
      </Center>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHydrated || !permisoConcedido) return;

    if (!user?.groupId) {
      toast({
        title: "Identificación de Grupo Requerida",
        description: "El reporte no se pudo guardar, ¡no pudimos identificar tu grupo!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();

    formData.append("nombre", actividadBase.nombre);
    formData.append("ubicacion", actividadBase.ubicacion);
    formData.append("fecha_inicio", actividadBase.fecha_inicio);
    formData.append("fecha_fin", actividadBase.fecha_fin);
    formData.append("descripcion", actividadBase.descripcion);
    formData.append("area_conocimiento", actividadBase.area_conocimiento);
    formData.append("financiamiento", actividadBase.financiamiento);
    formData.append("group_id", actividadBase.group_id);
    formData.append("participantes_grupo", String(numMembers || 0));
    formData.append("aliados", allies || "");
    formData.append("participantes_estimados", String(expectedBeneficiaries || 0));
    formData.append("participantes_reales", String(actualBeneficiaries || 0));
    formData.append("galeria_url", galleryUrl || "");
    formData.append("observaciones", observations || "");

    if (imageFile) {
      formData.append("cubierta", imageFile);
    }
    if (attendeeFile) {
      formData.append("lista_participantes", attendeeFile);
    }

    try {
      const token = localStorage.getItem("token") || "";
      
      const response = await apiRequest(`activities/${id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && (response.error || response.status === 500 || response.status === 400)) {
        throw new Error(response.message || "El servidor backend rechazó la actualización del reporte.");
      }

      toast({
        title: "Reporte enviado con éxito",
        description: "Los resultados de la actividad han sido guardados correctamente.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      router.push("/admingroup/nuestras_actividades");
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message || "Ocurrió un problema de conexión con el backend.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Reporte de Actividad</Heading>

      {/* Resumen incrustado de la Actividad */}
      <Box p={5} mb={6} borderRadius="md" bg="gray.50" borderLeft="4px solid" borderColor="primary.500">
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Heading size="md" color="gray.800">
            {actividadBase.nombre}
          </Heading>
        </Flex>

        <VStack align="stretch" spacing={1} fontSize="sm" color="gray.600" mt={3}>
          <Text>
            <strong>Fecha:</strong> {formatActivityDateRange(actividadBase.fecha_inicio, actividadBase.fecha_fin)}
          </Text>
          <Text>
            <strong>Ubicación:</strong> {actividadBase.ubicacion || "No especificada"}
          </Text>
        </VStack>
      </Box>

      <form onSubmit={handleSubmit}>
        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel mb={1}>Imagen de la Actividad</FormLabel>
            <FormHelperText mb={3}>
              Sube la imagen representativa del evento ejecutado para actualizar el registro visual.
            </FormHelperText>
            {previewImage && (
              <Image
                src={previewImage}
                alt="Preview"
                borderRadius="md"
                maxH="250px"
                objectFit="cover"
                mb={3}
              />
            )}
            <Input type="file" accept="image/*" onChange={handleImageChange} pt={1} />
          </FormControl>

          {/* Campos Editables */}
          <FormControl isRequired>
            <FormLabel>Número de Miembros del Grupo</FormLabel>
            <Input
              type="number"
              value={numMembers}
              onChange={(e) => setNumMembers(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <FormHelperText>
              Indique el número de integrantes del grupo que participaron en la ejecución de la actividad
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Si la actividad fue realizada con algún(os) aliado(s)</FormLabel>
            <Input
              placeholder="Indique nombre(s) y aporte(s) si los hubo"
              value={allies}
              onChange={(e) => setAllies(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Número de personas que estimaban beneficiar con la actividad</FormLabel>
            <Input
              type="number"
              value={expectedBeneficiaries}
              onChange={(e) => setExpectedBeneficiaries(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Número de personas realmente beneficiadas con la actividad</FormLabel>
            <Input
              type="number"
              value={actualBeneficiaries}
              onChange={(e) => setActualBeneficiaries(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Reporte Fotográfico</FormLabel>
            <Input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={galleryUrl}
              onChange={(e) => setGalleryUrl(e.target.value)}
            />
            <FormHelperText>
              Por favor, subir las fotos que mejor representen la actividad realizada a drive y compartir link. La carpeta de drive debe ser especifica para la actividad y el acceso debe ser publico.
            </FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Listado de Asistencia (.pdf, .xlsx, .xls)</FormLabel>
            <Input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={(e) => setAttendeeFile(e.target.files?.[0] || null)}
              pt={1}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Observaciones</FormLabel>
            <Textarea
              placeholder="Ingrese observaciones adicionales"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={5}
            />
          </FormControl>

          <Flex justify="space-between" mt={7}>
            <Button colorScheme="gray" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button 
              colorScheme="primary" 
              type="submit"
              isLoading={loading}
              loadingText="Enviando..."
            >
              Enviar Reporte
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}
