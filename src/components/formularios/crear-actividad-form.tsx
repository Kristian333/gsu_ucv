"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
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
  Textarea,
  Image,
  Heading,
  VStack,
  useToast,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";
import { TIPOS_ACTIVIDAD } from "@/constants/types";
import { getActivityErrorMessage } from "@/utils/errorMapper";

export default function CrearActividadForm() {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [esMultidia, setEsMultidia] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    location: "",
    fecha_inicio: "", 
    fecha_fin: "",    
    descripcion: "",
    area_conocimiento: [] as string[],
    financiamiento: "",
    financing_org: ""
  });

  const [locationParts, setLocationParts] = useState({
    pais: "",
    estado: "",
    municipio: "",
    detalle: ""
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const errors = {
    nombre: submitted && !form.nombre.trim(),
    imageFile: submitted && !imageFile,
    pais: submitted && !locationParts.pais.trim(),
    estado: submitted && !locationParts.estado.trim(),
    municipio: submitted && !locationParts.municipio.trim(),
    detalle: submitted && !locationParts.detalle.trim(),
    fecha_inicio: submitted && !form.fecha_inicio,
    fecha_fin: submitted && esMultidia && !form.fecha_fin,
    area_conocimiento: submitted && form.area_conocimiento.length === 0,
    financiamiento: submitted && !form.financiamiento,
    financing_org: submitted && form.financiamiento === "SI" && !form.financing_org.trim(),
    descripcion: submitted && !form.descripcion.trim(),
  };

  useEffect(() => {
    const { pais, estado, municipio, detalle } = locationParts;
    if (pais || estado || municipio || detalle) {
      const fullAddress = `${pais}, ${estado}, ${municipio}, ${detalle}`;
      setForm((prev) => ({ ...prev, location: fullAddress }));
    }
  }, [locationParts]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

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

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!isHydrated) return;

    setSubmitted(true);

    const camposFaltantes: string[] = [];

    if (!form.nombre.trim()) camposFaltantes.push("• Título de la Actividad");
    if (!imageFile) camposFaltantes.push("• Imagen Referencial de la Actividad");
    if (!locationParts.pais.trim()) camposFaltantes.push("• Ubicación: País");
    if (!locationParts.estado.trim()) camposFaltantes.push("• Ubicación: Estado");
    if (!locationParts.municipio.trim()) camposFaltantes.push("• Ubicación: Municipio");
    if (!locationParts.detalle.trim()) camposFaltantes.push("• Ubicación: Dirección Específica");
    if (!form.fecha_inicio) camposFaltantes.push("• Fecha de Inicio / Realización");
    if (esMultidia && !form.fecha_fin) camposFaltantes.push("• Fecha de Finalización");
    if (form.area_conocimiento.length === 0) camposFaltantes.push("• Área de Conocimiento");
    if (!form.financiamiento) camposFaltantes.push("• Financiamiento");
    if (form.financiamiento === "SI" && !form.financing_org.trim()) {
      camposFaltantes.push("• Organización Financiadora");
    }
    if (!form.descripcion.trim()) camposFaltantes.push("• Descripción de la Actividad");

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
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    if (!user?.groupId) {
      toast({
        title: "Identificación de Grupo Requerida",
        description: "La actividad no se pudo crear, ¡no pudimos identificar tu grupo! Por favor contacta al administrador.",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();

    formData.append("nombre", form.nombre.trim());
    formData.append("descripcion", form.descripcion.trim());
    formData.append("fecha_inicio", form.fecha_inicio); 
    formData.append(
      "fecha_fin",
      esMultidia ? form.fecha_fin : form.fecha_inicio
    );
    
    const { pais, estado, municipio, detalle } = locationParts;
    const direccionCompleta = `${pais.trim()}, ${estado.trim()}, ${municipio.trim()}, ${detalle.trim()}`;
    formData.append("ubicacion", direccionCompleta);

    form.area_conocimiento.forEach((area) => {
      formData.append("area_conocimiento", area.toUpperCase());
    });

    if (form.financiamiento === "SI") {
      formData.append("financiamiento", (form.financing_org.trim() || "SI").toUpperCase());
    } else {
      formData.append("financiamiento", "NO");
    }

    formData.append("group_id", String(user.groupId));

    const userIdNum = user?.id ? parseInt(String(user.id), 10) : NaN;
    
    if (isNaN(userIdNum)) {
      toast({
        title: "Sesión inválida",
        description: "No se encontró el ID del usuario actual. Por favor reingresa.",
        status: "error",
      });
      setLoading(false);
      return;
    }
      
    formData.append("subido_por", String(userIdNum));

    if (imageFile) {
      formData.append("cubierta", imageFile);
    }

    try {
      const token = localStorage.getItem("token") || ""; 

      const response = await apiRequest('activities', { 
        method: 'POST',
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response && (response.error || response.status === 500 || response.status === 400)) {
        throw new Error(response.message || "El servidor backend rechazó la petición.");
      }

      toast({
        title: "Actividad creada",
        description: "La actividad ha sido publicada exitosamente.",
        status: "success",
      });
      router.push("/admingroup/nuestras_actividades");
    } catch (error: any) {
      const friendlyMessage = getActivityErrorMessage(error.message);
      toast({ title: "Error al crear actividad", description: friendlyMessage, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Planificar Actividad</Heading>
      <VStack spacing={5} align="stretch">
        
        {/* Título */}
        <FormControl isRequired isInvalid={errors.nombre}>
          <FormLabel>Título de la Actividad</FormLabel>
          <Input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre de Actividad"
          />
          {errors.nombre && (
            <FormErrorMessage>Este campo es obligatorio.</FormErrorMessage>
          )}
        </FormControl>

        {/* Imagen Cubierta */}
        <FormControl isRequired isInvalid={errors.imageFile}>
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
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          {errors.imageFile && (
            <FormErrorMessage>Debe seleccionar una imagen referencial.</FormErrorMessage>
          )}
        </FormControl>

        {/* Ubicación */}
        <Box border="1px" borderColor={errors.pais || errors.estado || errors.municipio || errors.detalle ? "red.500" : "gray.100"} p={4} borderRadius="md" bg={errors.pais || errors.estado || errors.municipio || errors.detalle ? "red.50" : "gray.50"}>
          <Heading size="sm" mb={4}>Ubicación de la Actividad*</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired isInvalid={errors.pais}>
              <FormLabel fontSize="sm">País</FormLabel>
              <Input 
                name="pais" 
                bg="white"
                value={locationParts.pais} 
                onChange={handleLocationChange} 
                placeholder="Ej: Venezuela" 
              />
              {errors.pais && (
                <FormErrorMessage>El país es requerido.</FormErrorMessage>
              )}
            </FormControl>
            
            <FormControl isRequired isInvalid={errors.estado}>
              <FormLabel fontSize="sm">Estado</FormLabel>
              <Input 
                name="estado" 
                bg="white"
                value={locationParts.estado} 
                onChange={handleLocationChange} 
                placeholder="Ej: Carabobo" 
              />
              {errors.estado && (
                <FormErrorMessage>El estado es requerido.</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={errors.municipio}>
              <FormLabel fontSize="sm">Municipio</FormLabel>
              <Input 
                name="municipio" 
                bg="white"
                value={locationParts.municipio} 
                onChange={handleLocationChange} 
                placeholder="Ej: Valencia" 
              />
              {errors.municipio && (
                <FormErrorMessage>El municipio es requerido.</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={errors.detalle}>
              <FormLabel fontSize="sm">Dirección Específica</FormLabel>
              <Input 
                name="detalle" 
                bg="white"
                value={locationParts.detalle} 
                onChange={handleLocationChange} 
                placeholder="Ej: Av. Bolívar, Edif. X" 
              />
              {errors.detalle && (
                <FormErrorMessage>La dirección específica es requerida.</FormErrorMessage>
              )}
            </FormControl>
          </SimpleGrid>
        </Box>

        <Box width="100%" height="1px" bg="gray.200" mx="auto" my={2} borderRadius="full" />
        
        {/* Multidía */}
        <FormControl>
          <Checkbox isChecked={esMultidia} onChange={handleMultidiaChange} colorScheme="primary">
            La actividad se realizará durante varios días
          </Checkbox>
        </FormControl>

        {/* Fechas */}
        {!esMultidia ? (
          <FormControl isRequired isInvalid={errors.fecha_inicio}>
            <FormLabel>Fecha de Realización</FormLabel>
            <Input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
            />
            {errors.fecha_inicio && (
              <FormErrorMessage>Seleccione la fecha de realización.</FormErrorMessage>
            )}
          </FormControl>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired isInvalid={errors.fecha_inicio}>
              <FormLabel>Fecha de Inicio</FormLabel>
              <Input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
              />
              {errors.fecha_inicio && (
                <FormErrorMessage>Seleccione la fecha de inicio.</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isRequired isInvalid={errors.fecha_fin}>
              <FormLabel>Fecha de Finalización</FormLabel>
              <Input
                type="date"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={handleChange}
                min={form.fecha_inicio}
              />
              {errors.fecha_fin && (
                <FormErrorMessage>Seleccione la fecha de finalización.</FormErrorMessage>
              )}
            </FormControl>
          </SimpleGrid>
        )}

        {/* Área de conocimiento */}
        <FormControl isRequired isInvalid={errors.area_conocimiento}>
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
          {errors.area_conocimiento && (
            <FormErrorMessage>Debe seleccionar al menos un área de conocimiento.</FormErrorMessage>
          )}
        </FormControl>

        {/* Financiamiento */}
        <FormControl isRequired isInvalid={errors.financiamiento}>
          <FormLabel>Financiamiento</FormLabel>
          <Select name="financiamiento" value={form.financiamiento} onChange={handleChange}>
            <option value="">Seleccione...</option>
            <option value="SI">SI</option>
            <option value="NO">NO</option>
          </Select>
          {errors.financiamiento && (
            <FormErrorMessage>Seleccione si posee financiamiento.</FormErrorMessage>
          )}
        </FormControl>

        {form.financiamiento === "SI" && (
          <FormControl isRequired isInvalid={errors.financing_org}>
            <FormLabel>Organización Financiadora</FormLabel>
            <Input
              name="financing_org"
              value={form.financing_org}
              onChange={handleChange}
              placeholder="Nombre de la organización"
            />
            {errors.financing_org && (
              <FormErrorMessage>Indique el nombre de la organización financiadora.</FormErrorMessage>
            )}
          </FormControl>
        )}

        {/* Descripción */}
        <FormControl isRequired isInvalid={errors.descripcion}>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Describe la actividad..."
            rows={5}
          />
          {errors.descripcion && (
            <FormErrorMessage>La descripción es obligatoria.</FormErrorMessage>
          )}
        </FormControl>

        {/* Botones de acción */}
        <Flex justify="space-between" mt={7}>
          <Button colorScheme="gray" onClick={() => router.back()}>
            Cancelar
          </Button>

          <Button 
            colorScheme="primary" 
            onClick={handleCreate} 
            isLoading={loading || !isHydrated}
            loadingText="Creando..."
          >
            Crear Actividad
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
