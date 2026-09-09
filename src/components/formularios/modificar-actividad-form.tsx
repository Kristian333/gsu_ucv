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
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";
import { validateGroupAccess } from "@/utils/auth-guards";
import { TIPOS_ACTIVIDAD } from "@/constants/types";

interface ModificarActividadFormProps {
  id: string;
}

export default function ModificarActividadForm({ id }: ModificarActividadFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();

  const [loadingActividad, setLoadingActividad] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [permisoConcedido, setPermisoConcedido] = useState(false);
  const [esMultidia, setEsMultidia] = useState(false);
  const [inicialEsMultidia, setInicialEsMultidia] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    location: "",
    fecha_inicio: "", 
    fecha_fin: "",    
    descripcion: "",
    area_conocimiento: [] as string[],
    financiamiento: "",
    financing_org: "",
  });

  const [locationParts, setLocationParts] = useState({
    pais: "",
    estado: "",
    municipio: "",
    detalle: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  
  const verificarSiYaIniciOOPaso = (fechaInicioString: string): boolean => {
    if (!fechaInicioString) return false;
    const fechaInicioFormateada = fechaInicioString.substring(0, 10);
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const fechaHoyFormateada = `${anio}-${mes}-${dia}`;

    return fechaHoyFormateada >= fechaInicioFormateada;
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
              position: "top"
            });
            router.push("/admingroup/nuestras_actividades");
            return;
          }

          if (data.fecha_inicio && verificarSiYaIniciOOPaso(data.fecha_inicio)) {
            toast({
              title: "Modificación inhabilitada",
              description: "No se puede editar una actividad que ya ha iniciado o finalizado.",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top"
            });
            router.push("/admingroup/nuestras_actividades");
            return;
          }

          let areasArray: string[] = [];
          if (Array.isArray(data.area_conocimiento)) {
            areasArray = data.area_conocimiento;
          } else if (typeof data.area_conocimiento === "string" && data.area_conocimiento.length > 0) {
            areasArray = data.area_conocimiento.split(",").map((a: string) => a.trim());
          }

          const esSi = data.financiamiento && data.financiamiento !== "NO" && data.financiamiento !== "";

          const fInicio = data.fecha_inicio ? data.fecha_inicio.substring(0, 10) : "";
          const fFin = data.fecha_fin ? data.fecha_fin.substring(0, 10) : "";

          // Comprobamos si vino con fechas distintas desde la BD
          const tieneFechasDiferentes = Boolean(fInicio && fFin && fInicio !== fFin);
          setEsMultidia(tieneFechasDiferentes);
          setInicialEsMultidia(tieneFechasDiferentes);

          setForm({
            nombre: data.nombre || "",
            location: data.ubicacion || "",
            fecha_inicio: fInicio,
            fecha_fin: fFin || fInicio,
            descripcion: data.descripcion || "",
            area_conocimiento: areasArray,
            financiamiento: esSi ? "SI" : "NO",
            financing_org: esSi ? data.financiamiento : "",
          });

          setPreviewImage(data.reporte_url || data.reporte || null);

          if (data.ubicacion && data.ubicacion.includes(",")) {
            const partes = data.ubicacion.split(",").map((p: string) => p.trim());
            setLocationParts({
              pais: partes[0] || "",
              estado: partes[1] || "",
              municipio: partes[2] || "",
              detalle: partes.slice(3).join(", ") || "",
            });
          } else if (data.ubicacion) {
            setLocationParts((prev) => ({ ...prev, detalle: data.ubicacion }));
          }

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

  useEffect(() => {
    const { pais, estado, municipio, detalle } = locationParts;
    if (pais || estado || municipio || detalle) {
      const fullAddress = `${pais}, ${estado}, ${municipio}, ${detalle}`;
      setForm((prev) => ({ ...prev, location: fullAddress }));
    }
  }, [locationParts]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Si no es multidía y cambia la fecha de inicio, mantenemos fecha_fin alineada
    if (!esMultidia && name === "fecha_inicio") {
      setForm((prev) => ({
        ...prev,
        fecha_inicio: value,
        fecha_fin: value,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMultidiaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setEsMultidia(isChecked);

    // Al desactivar multidía, igualamos fecha_fin con fecha_inicio
    if (!isChecked && form.fecha_inicio) {
      setForm((prev) => ({ ...prev, fecha_fin: prev.fecha_inicio }));
    }
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

  if (!isHydrated || loadingActividad || !permisoConcedido) {
    return (
      <Center h="70vh" flexDirection="column" gap={4}>
        <Spinner size="xl" color="primary.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">Validando credenciales de acceso y cronograma...</Text>
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

  const handleSave = async () => {
    if (!isHydrated || !permisoConcedido) return;

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
    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    formData.append("fecha_inicio", form.fecha_inicio); 
    formData.append("fecha_fin", esMultidia ? form.fecha_fin : form.fecha_inicio);
    const { pais, estado, municipio, detalle } = locationParts;
    const direccionCompleta = `${pais}, ${estado}, ${municipio}, ${detalle}`;
    formData.append("ubicacion", direccionCompleta);
    if (form.area_conocimiento && form.area_conocimiento.length > 0) {
      form.area_conocimiento.forEach((area) => {
        formData.append("area_conocimiento", area);
      });
    } else {
      formData.append("area_conocimiento", "Otros");
    }

    if (form.financiamiento === "SI") {
      formData.append("financiamiento", (form.financing_org || "SI").toUpperCase());
    } else {
      formData.append("financiamiento", "NO");
    }

    formData.append("group_id", String(user.groupId));
    if (user?.id) {
      formData.append("subido_por", String(user.id));
    }

    if (newImageFile) {
      formData.append("cubierta", newImageFile);
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
  
  const getCheckboxLabel = () => {
    if (inicialEsMultidia) {
      return esMultidia
        ? "La actividad dura varios días"
        : "Establecer un solo día de realización";
    } else {
      return esMultidia
        ? "Cambiar a rango de varios días"
        : "Establecer un solo día de realización";
    }
  };

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Modificar Actividad</Heading>

      <VStack spacing={5} align="stretch">
        <FormControl isRequired>
          <FormLabel>Título de la Actividad</FormLabel>
          <Input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre de Actividad"
          />
        </FormControl>

        <FormControl>
          <FormLabel mb={1}>Imagen Referencial de la Actividad</FormLabel>
          <Text fontSize="xs" color="gray.500" mb={3} lineHeight="tall" bg="primary.50/50" p={2} borderRadius="md" borderLeft="3px solid" borderColor="primary.400">
            💡 <strong>Nota sobre la imagen:</strong> Puedes subir una foto temporal o general que ilustre la actividad que planean ejecutar (por ejemplo, de un evento similar anterior). Posteriormente, al finalizar la jornada y rellenar el reporte final de la actividad, podrás sustituirla por los registros fotográficos reales capturados durante el evento.
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
          <Input type="file" accept="image/*" onChange={handleImageChange} pt={1} />
        </FormControl>

        <Box border="1px" borderColor="gray.100" p={4} borderRadius="md" bg="gray.50">
          <Heading size="sm" mb={4}>Ubicación de la Actividad*</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">País</FormLabel>
              <Input
                name="pais"
                bg="white"
                value={locationParts.pais}
                onChange={handleLocationChange}
                placeholder="Ej: Venezuela"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Estado</FormLabel>
              <Input
                name="estado"
                bg="white"
                value={locationParts.estado}
                onChange={handleLocationChange}
                placeholder="Ej: Carabobo"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Municipio</FormLabel>
              <Input
                name="municipio"
                bg="white"
                value={locationParts.municipio}
                onChange={handleLocationChange}
                placeholder="Ej: Valencia"
              />
            </FormControl>
            <FormControl isRequired>
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

        <Box width="100%" height="1px" bg="gray.200" mx="auto" my={2} borderRadius="full" />

        {/* Checkbox con texto adaptativo según el origen de la data */}
        <FormControl>
          <Checkbox isChecked={esMultidia} onChange={handleMultidiaChange} colorScheme="primary">
            {getCheckboxLabel()}
          </Checkbox>
        </FormControl>

        {/* Renderizado condicional de los campos de fecha */}
        {!esMultidia ? (
          <FormControl isRequired>
            <FormLabel>Fecha de Realización</FormLabel>
            <Input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
            />
          </FormControl>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Fecha de Inicio</FormLabel>
              <Input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Fecha de Finalización</FormLabel>
              <Input
                type="date"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={handleChange}
                min={form.fecha_inicio}
              />
            </FormControl>
          </SimpleGrid>
        )}
        
        <FormControl isRequired>
          <FormLabel>ÁREA DE CONOCIMIENTO</FormLabel>
          <CheckboxGroup
            value={form.area_conocimiento}
            onChange={(val) => setForm({ ...form, area_conocimiento: val as string[] })}
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

        <FormControl isRequired>
          <FormLabel>Financiamiento</FormLabel>
          <Select name="financiamiento" value={form.financiamiento} onChange={handleChange}>
            <option value="">Seleccione...</option>
            <option value="SI">SI</option>
            <option value="NO">NO</option>
          </Select>
        </FormControl>

        {form.financiamiento === "SI" && (
          <FormControl isRequired>
            <FormLabel>Organización Financiadora</FormLabel>
            <Input
              name="financing_org"
              value={form.financing_org}
              onChange={handleChange}
              placeholder="Nombre de la organización"
            />
          </FormControl>
        )}

        <FormControl isRequired>
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
            colorScheme="primary" 
            onClick={handleSave} 
            isLoading={loading}
            loadingText="Guardando..."
          >
            Guardar Cambios
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
