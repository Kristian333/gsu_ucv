"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
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
  Textarea,
  Image,
  Heading,
  VStack,
  useToast,
  SimpleGrid,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";

interface ModificarActividadFormProps {
  id: string;
}

export default function ModificarActividadForm({ id }: ModificarActividadFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();

  const [loadingActividad, setLoadingActividad] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [esBloqueada, setEsBloqueada] = useState(false);
  const [loading, setLoading] = useState(false);


  const [form, setForm] = useState({
    nombre: "",
    location: "",
    fecha: "",
    descripcion: "",
    area_conocimiento: [] as string[],
    financiamiento: "",
    financing_org: "",
  });

  // Estado idéntico para dividir la ubicación geográfica en partes
  const [locationParts, setLocationParts] = useState({
    pais: "",
    estado: "",
    municipio: "",
    detalle: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  // --- VALIDACIÓN DE FECHA LÍMITE ---
  const verificarSiYaPasoOHoy = (fechaString: string): boolean => {
    const fechaActividadFormateada = fechaString.substring(0, 10);
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const fechaHoyFormateada = `${anio}-${mes}-${dia}`;

    return fechaActividadFormateada <= fechaHoyFormateada;
  };

  // --- CONSULTA AUTOMÁTICA AL BACKEND AL MONTAR LA PANTALLA ---
  useEffect(() => {
    if (!id) {
      setErrorCarga("No se recibió el identificador de la actividad.");
      setLoadingActividad(false);
      return;
    }

    const obtenerDatosDeBD = async () => {
      try {
        const data = await apiRequest(`activities/${id}`, { method: "GET" });

        if (data && !data.error) {
          // 1. Cargamos el estado general del formulario
          setForm({
            nombre: data.nombre || "",
            location: data.location || "",
            fecha: data.fecha ? data.fecha.substring(0, 10) : "",
            descripcion: data.descripcion || "",
            area_conocimiento: Array.isArray(data.area_conocimiento)
              ? data.area_conocimiento
              : data.area_conocimiento
              ? JSON.parse(data.area_conocimiento)
              : [],
            financiamiento: data.financiamiento || "",
            financing_org: data.financing_org || "",
          });

          setPreviewImage(data.image || null);

          if (data.location && data.location.includes(",")) {
            const partes = data.location.split(",").map((p: string) => p.trim());
            setLocationParts({
              pais: partes[0] || "",
              estado: partes[1] || "",
              municipio: partes[2] || "",
              detalle: partes[3] || "",
            });
          } else if (data.location) {
            setLocationParts(prev => ({ ...prev, detalle: data.location }));
          }

          if (data.fecha) {
            setEsBloqueada(verificarSiYaPasoOHoy(data.fecha));
          }
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
  }, [id]);

  useEffect(() => {
    const { pais, estado, municipio, detalle } = locationParts;
    if (pais || estado || municipio || detalle) {
      const fullAddress = `${pais}, ${estado}, ${municipio}, ${detalle}`;
      setForm((prev) => ({ ...prev, location: fullAddress }));
    }
  }, [locationParts]);
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocationParts({ ...locationParts, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleSave = async () => {
    if (!isHydrated) return;
    
    if (esBloqueada) {
      toast({ 
        title: "Acción denegada", 
        description: "No se puede modificar una actividad de fecha pasada o del mismo día.", 
        status: "error" 
      });
      return;
    }

    if (!user?.groupId) {
      toast({
        title: "Identificación de Grupo Requerida",
        description: "La actividad no se pudo actualizar, ¡no pudimos identificar tu grupo!",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      let value = form[key as keyof typeof form];
      
      if (key === "financiamiento") {
        if (form.financiamiento === "SI") {
          value = form.financing_org || "SI";
        }
      }

      if (key !== "financing_org" && value !== "" && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    formData.append("group_id", String(user.groupId));
    if (user?.id) {
      formData.append("uploaded_by", String(user.id));
    }

    // Estructura idéntica de archivos multimedia para tu backend en Go
    if (newImageFile) {
      formData.append("reporte", newImageFile);
    } else if (previewImage) {
      formData.append("image_url", previewImage);
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
        throw new Error(response.message || "El servidor backend rechazó la actualización.");
      }

      toast({
        title: "Actividad actualizada",
        description: "Los cambios han sido guardados exitosamente.",
        status: "success",
      });
      router.push("/admingroup/nuestras_actividades");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingActividad) {
    return (
      <Center h="70vh" flexDirection="column" gap={4}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">Cargando datos previos de la actividad...</Text>
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

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Modificar Actividad</Heading>

      {esBloqueada && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Modificación deshabilitada</AlertTitle>
            <AlertDescription display="block">
              Esta actividad se ejecuta hoy o ya pertenece al pasado. No se permiten modificaciones.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <VStack spacing={5} align="stretch">
        <FormControl isRequired isDisabled={esBloqueada}>
          <FormLabel>Título de la Actividad</FormLabel>
          <Input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre de Actividad"
          />
        </FormControl>

        <FormControl isRequired isDisabled={esBloqueada}>
          <FormLabel mb={1}>Imagen Referencial de la Actividad</FormLabel>
          <Text fontSize="xs" color="gray.500" mb={3} lineHeight="tall" bg="teal.50/50" p={2} borderRadius="md" borderLeft="3px solid" borderColor="teal.400">
            <strong>Nota sobre la imagen:</strong> Al finalizar la jornada y rellenar el reporte final de la actividad, podrás sustituir esta imagen por los registros fotográficos reales capturados durante el evento.
          </Text>
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
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </FormControl>

        <Box border="1px" borderColor="gray.100" p={4} borderRadius="md" bg="gray.50">
          <Heading size="sm" mb={4}>Ubicación de la Actividad*</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired isDisabled={esBloqueada}>
              <FormLabel fontSize="sm">País</FormLabel>
              <Input
                name="pais"
                bg="white"
                value={locationParts.pais}
                onChange={handleLocationChange}
                placeholder="Ej: Venezuela"
              />
            </FormControl>
            <FormControl isRequired isDisabled={esBloqueada}>
              <FormLabel fontSize="sm">Estado</FormLabel>
              <Input
                name="estado"
                bg="white"
                value={locationParts.estado}
                onChange={handleLocationChange}
                placeholder="Ej: Carabobo"
              />
            </FormControl>
            <FormControl isRequired isDisabled={esBloqueada}>
              <FormLabel fontSize="sm">Municipio</FormLabel>
              <Input
                name="municipio"
                bg="white"
                value={locationParts.municipio}
                onChange={handleLocationChange}
                placeholder="Ej: Valencia"
              />
            </FormControl>
            <FormControl isRequired isDisabled={esBloqueada}>
              <FormLabel fontSize="sm">Dirección Específica</FormLabel>
              <Input
                name="detalle"
                bg="white"
                value={locationParts.detalle}
                onChange={handleLocationChange}
                placeholder="Ej: Av. Bolívar, Edif. X"
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        <FormControl isRequired isDisabled={esBloqueada}>
          <FormLabel>Fecha</FormLabel>
          <Input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired isDisabled={esBloqueada}>
          <FormLabel>ÁREA DE CONOCIMIENTO</FormLabel>
          <CheckboxGroup
            value={form.area_conocimiento}
            onChange={(val) => setForm({ ...form, area_conocimiento: val as string[] })}
          >
            <VStack align="stretch">
              {[
                "SALUD",
                "ACCIÓN SOCIAL",
                "CULTURAL",
                "DEPORTIVA",
                "AMBIENTE/CONSERVACIÓN",
                "INVESTIGACIÓN",
                "RECREACIÓN",
                "DEBATE",
                "OTROS",
              ].map((a) => (
                <Checkbox key={a} value={a} isDisabled={esBloqueada}>
                  {a}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </FormControl>

        <FormControl isRequired isDisabled={esBloqueada}>
          <FormLabel>Financiamiento</FormLabel>
          <Select name="financiamiento" value={form.financiamiento} onChange={handleChange}>
            <option value="">Seleccione...</option>
            <option value="SI">SI</option>
            <option value="NO">NO</option>
          </Select>
        </FormControl>

        {form.financiamiento === "SI" && (
          <FormControl isRequired isDisabled={esBloqueada}>
            <FormLabel>Organización Financiadora</FormLabel>
            <Input
              name="financing_org"
              value={form.financing_org}
              onChange={handleChange}
              placeholder="Nombre de la organización"
            />
          </FormControl>
        )}

        <FormControl isRequired isDisabled={esBloqueada}>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Describe la actividad..."
            rows={5}
          />
        </FormControl>

        <Flex justify="space-between" mt={7}>
          <Button colorScheme="gray" onClick={() => router.back()}>
                      Cancelar
                    </Button>
          
                    <Button 
                      colorScheme="teal" 
                      onClick={handleSave} 
                      isLoading={loading || !isHydrated}
                      loadingText="Guardando..."
                    >
                      Guardar Cambios
                    </Button>
                  </Flex>
          
                </VStack>
              </Box>
            );
          }
