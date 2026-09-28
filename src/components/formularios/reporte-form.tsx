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
  FormErrorMessage,
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
import { getActivityErrorMessage } from "@/utils/errorMapper";

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
  const [submitted, setSubmitted] = useState(false);

  const [permisoConcedido, setPermisoConcedido] = useState(false);

  const [actividadBase, setActividadBase] = useState({
    nombre: "",
    ubicacion: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
    area_conocimiento: [] as string[],
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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isDriveUrlValid = (url: string) => {
    if (!url.trim()) return false;
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.hostname === "drive.google.com" ||
        parsedUrl.hostname === "www.drive.google.com"
      );
    } catch {
      return false;
    }
  };

  const errors = {
    numMembers: submitted && (numMembers === "" || Number(numMembers) < 0),
    expectedBeneficiaries: submitted && (expectedBeneficiaries === "" || Number(expectedBeneficiaries) < 0),
    actualBeneficiaries: submitted && (actualBeneficiaries === "" || Number(actualBeneficiaries) < 0),
    galleryUrl: submitted && (!galleryUrl.trim() || !isDriveUrlValid(galleryUrl)),
    attendeeFile: submitted && !attendeeFile,
    imageFile: submitted && !imageFile && !existingImageUrl,
  };

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
              position: "top",
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
              position: "top",
            });
            router.push("/admingroup/nuestras_actividades");
            return;
          }

          const grupoActividad = data.group_id ?? data.groupId;

          let areasArray: string[] = [];
          if (Array.isArray(data.area_conocimiento)) {
            areasArray = data.area_conocimiento;
          } else if (typeof data.area_conocimiento === "string" && data.area_conocimiento.length > 0) {
            areasArray = data.area_conocimiento.split(",").map((a: string) => a.trim());
          }

          setActividadBase({
            nombre: data.nombre || "",
            ubicacion: data.ubicacion || "",
            fecha_inicio: data.fecha_inicio || "",
            fecha_fin: data.fecha_fin || "",
            descripcion: data.descripcion || "",
            area_conocimiento: areasArray,
            financiamiento: data.financiamiento || "",
            group_id: String(grupoActividad),
          });

          const imagenPrev = data.cubierta || data.reporte_url || data.reporte || null;
          setExistingImageUrl(imagenPrev);
          setPreviewImage(imagenPrev);

          setNumMembers(data.participantes_grupo ?? "");
          setAllies(data.aliados || "");
          setExpectedBeneficiaries(data.participantes_estimados ?? "");
          setActualBeneficiaries(data.participantes_reales ?? "");
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

    setSubmitted(true);

    const camposFaltantes: string[] = [];

    if (!imageFile && !existingImageUrl) {
      camposFaltantes.push("• Imagen de la Actividad");
    }
    if (numMembers === "" || Number(numMembers) < 0) {
      camposFaltantes.push("• Número de Miembros del Grupo");
    }
    if (expectedBeneficiaries === "" || Number(expectedBeneficiaries) < 0) {
      camposFaltantes.push("• Personas Estimadas a Beneficiar");
    }
    if (actualBeneficiaries === "" || Number(actualBeneficiaries) < 0) {
      camposFaltantes.push("• Personas Realmente Beneficiadas");
    }
    if (!galleryUrl.trim()) {
      camposFaltantes.push("• Reporte Fotográfico (Enlace de Drive)");
    } else if (!isDriveUrlValid(galleryUrl)) {
      camposFaltantes.push("• El enlace del Reporte Fotográfico debe ser un dominio de Google Drive (drive.google.com)");
    }
    if (!attendeeFile) {
      camposFaltantes.push("• Listado de Asistencia");
    }

    if (camposFaltantes.length > 0) {
      return toast({
        title: "Campos faltantes o inválidos",
        description: (
          <Box mt={2}>
            <Text mb={1}>Por favor complete o corrija los siguientes datos obligatorios:</Text>
            {camposFaltantes.map((campo, idx) => (
              <Text key={idx} fontSize="sm">
                {campo}
              </Text>
            ))}
          </Box>
        ),
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    if (!user?.groupId) {
      toast({
        title: "Identificación de Grupo Requerida",
        description: "La actividad no se pudo actualizar, no pudimos identificar tu grupo. Intenta iniciar sesión nuevamente y vuelve a intentarlo.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
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

    if (Array.isArray(actividadBase.area_conocimiento)) {
      actividadBase.area_conocimiento.forEach((area) => {
        formData.append("area_conocimiento", area);
      });
    } else if (actividadBase.area_conocimiento) {
      formData.append("area_conocimiento", actividadBase.area_conocimiento);
    }

    formData.append("financiamiento", actividadBase.financiamiento);

    const groupIdNum = parseInt(String(actividadBase.group_id || user.groupId), 10);
    if (!isNaN(groupIdNum)) {
      formData.append("group_id", String(groupIdNum));
    }

    const userIdNum = parseInt(String(user?.id), 10);
    if (!isNaN(userIdNum)) {
      formData.append("subido_por", String(userIdNum));
    }

    formData.append("participantes_grupo", String(numMembers || 0));
    formData.append("aliados", allies.trim() || "");
    formData.append("participantes_estimados", String(expectedBeneficiaries || 0));
    formData.append("participantes_reales", String(actualBeneficiaries || 0));
    formData.append("galeria_url", galleryUrl.trim() || "");
    formData.append("observaciones", observations.trim() || "");

    if (imageFile) {
      formData.append("cubierta", imageFile);
    } else if (existingImageUrl) {
      formData.append("cubierta", existingImageUrl);
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
      const friendlyMessage = getActivityErrorMessage(error.message);
      toast({
        title: "Error al guardar el reporte",
        description: friendlyMessage,
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
          <FormControl isRequired={!existingImageUrl} isInvalid={errors.imageFile}>
            <FormLabel mb={1}>Imagen de la Actividad</FormLabel>
            <FormHelperText mb={3}>
              {existingImageUrl
                ? "Puedes mantener la imagen actual registrada o seleccionar un archivo para cambiarla."
                : "Sube la imagen representativa del evento ejecutado para actualizar el registro visual."}
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
            {errors.imageFile && (
              <FormErrorMessage>Debe adjuntar una imagen representativa de la actividad.</FormErrorMessage>
            )}
          </FormControl>

          {/* Campos Editables */}
          <FormControl isRequired isInvalid={errors.numMembers}>
            <FormLabel>Número de Miembros del Grupo</FormLabel>
            <Input
              type="number"
              value={numMembers}
              onChange={(e) => setNumMembers(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <FormHelperText>
              Indique el número de integrantes del grupo que participaron en la ejecución de la actividad.
            </FormHelperText>
            {errors.numMembers && (
              <FormErrorMessage>Indique una cantidad válida de miembros del grupo.</FormErrorMessage>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Si la actividad fue realizada con algún(os) aliado(s)</FormLabel>
            <Input
              placeholder="Indique nombre(s) y aporte(s) si los hubo"
              value={allies}
              onChange={(e) => setAllies(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired isInvalid={errors.expectedBeneficiaries}>
            <FormLabel>Número de personas que estimaban beneficiar con la actividad</FormLabel>
            <Input
              type="number"
              value={expectedBeneficiaries}
              onChange={(e) => setExpectedBeneficiaries(e.target.value === "" ? "" : Number(e.target.value))}
            />
            {errors.expectedBeneficiaries && (
              <FormErrorMessage>Indique la cantidad estimada de beneficiarios.</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isRequired isInvalid={errors.actualBeneficiaries}>
            <FormLabel>Número de personas realmente beneficiadas con la actividad</FormLabel>
            <Input
              type="number"
              value={actualBeneficiaries}
              onChange={(e) => setActualBeneficiaries(e.target.value === "" ? "" : Number(e.target.value))}
            />
            {errors.actualBeneficiaries && (
              <FormErrorMessage>Indique la cantidad real de beneficiarios.</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isRequired isInvalid={errors.galleryUrl}>
            <FormLabel>Reporte Fotográfico</FormLabel>
            <Input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={galleryUrl}
              onChange={(e) => setGalleryUrl(e.target.value)}
            />
            <FormHelperText>
              Por favor, subir las fotos que mejor representen la actividad realizada a Google Drive y compartir el enlace. La carpeta debe ser específica y con acceso público.
            </FormHelperText>
            {errors.galleryUrl && (
              <FormErrorMessage>
                {!galleryUrl.trim()
                  ? "El enlace a la galería es obligatorio."
                  : "El enlace debe pertenecer al dominio drive.google.com."}
              </FormErrorMessage>
            )}
          </FormControl>

          <FormControl isRequired isInvalid={errors.attendeeFile}>
            <FormLabel>Listado de Asistencia (.pdf, .xlsx, .xls)</FormLabel>
            <Input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={(e) => setAttendeeFile(e.target.files?.[0] || null)}
              pt={1}
            />
            {errors.attendeeFile && (
              <FormErrorMessage>Debe adjuntar el archivo con la lista de asistencia.</FormErrorMessage>
            )}
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
