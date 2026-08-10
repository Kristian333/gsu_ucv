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
  Divider,
  Stack,
  FormHelperText,
  Image,
  useToast,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";

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
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [attendeeFile, setAttendeeFile] = useState<File | null>(null);
  const [observations, setObservations] = useState<string>("");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const verificarSiNoHaTerminado = (fechaFinString: string): boolean => {
    if (!fechaFinString) return false;
    const fechaFinFormateada = fechaFinString.substring(0, 10); 
    
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const fechaHoyFormateada = `${anio}-${mes}-${dia}`;

    return fechaHoyFormateada < fechaFinFormateada;
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
          const grupoActividad = data.group_id || data.groupId;

          if (!user?.groupId || String(grupoActividad) !== String(user.groupId)) {
            toast({
              title: "Acceso denegado",
              description: "Esta actividad pertenece a otro grupo.",
              status: "error",
              duration: 4000,
              isClosable: true,
              position: "top"
            });
            router.push("/admingroup/nuestras_actividades");
            return;
          }


          if (data.fecha_fin && verificarSiNoHaTerminado(data.fecha_fin)) {
            toast({
              title: "Reporte inhabilitado",
              description: "No se puede rellenar el reporte de una actividad que no ha finalizado.",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top"
            });
            router.push("/admingroup/nuestras_actividades");
            return;
          }

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
      <Center h="80vh" flexDirection="column" gap={4}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text fontSize="lg" fontWeight="medium" color="gray.600">
          Verificando permisos y cronograma del evento...
        </Text>
      </Center>
    );
  }

  if (errorCarga) {
    return (
      <Center h="80vh">
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
    formData.append("observaciones", observations || "");
    formData.append("reporte_revisado", "true"); 

    if (imageFile) {
      formData.append("reporte", imageFile);
    }
    if (attendeeFile) {
      formData.append("documento_asistencia", attendeeFile);
    }
    if (photoFiles && photoFiles.length > 0) {
      for (let i = 0; i < photoFiles.length; i++) {
        formData.append("galeria_fotos", photoFiles[i]);
      }
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
    <Box maxW="6xl" mx="auto" p={8} my={8} bg="white" rounded="lg" shadow="xl">
      <Heading size="2xl" mb={6} textAlign="center" color="teal.500">
        Reporte de Actividad
      </Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">

          {/* Información Protegida */}
          <FormControl isDisabled>
            <FormLabel>Nombre de la Actividad Realizada</FormLabel>
            <Input value={actividadBase.nombre} readOnly />
          </FormControl>

          <FormControl isDisabled>
            <FormLabel>Fecha de Inicio de la Actividad</FormLabel>
            <Input value={actividadBase.fecha_inicio ? actividadBase.fecha_inicio.substring(0, 10) : ""} readOnly />
          </FormControl>

          <FormControl isDisabled>
            <FormLabel>Fecha de Fin de la Actividad</FormLabel>
            <Input value={actividadBase.fecha_fin ? actividadBase.fecha_fin.substring(0, 10) : ""} readOnly />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Imagen de la Actividad</FormLabel>
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
              placeholder="Indique nombre(s) y aporte(s)"
              value={allies}
              onChange={(e) => setAllies(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Número de personas que pensaban beneficiar con la actividad</FormLabel>
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
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setPhotoFiles(e.target.files)}
              pt={1}
            />
            <FormHelperText>
              Por favor, subir las 5 fotos que mejor representen la actividad realizada. Formato imagen y vídeo corto. Total máximo: 10 MB.
            </FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Listado del Público Asistente</FormLabel>
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

          <Flex justify="flex-end" gap={4}>
            <Button colorScheme="gray" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button 
              colorScheme="teal" 
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
