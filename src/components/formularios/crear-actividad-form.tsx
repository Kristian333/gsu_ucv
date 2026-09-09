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
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";
import { TIPOS_ACTIVIDAD } from "@/constants/types";

export default function CrearActividadForm() {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();
  const [loading, setLoading] = useState(false);
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
  
  useEffect(() => {
    const { pais, estado, municipio, detalle } = locationParts;
    if (pais || estado || municipio || detalle) {
      const fullAddress = `${pais}, ${estado}, ${municipio}, ${detalle}`;
      setForm((prev) => ({ ...prev, location: fullAddress }));
    }
  }, [locationParts]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Si no es multidía y cambia la fecha de inicio, asignamos la misma fecha a fecha_fin
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

    // Si se desmarca, aseguramos que la fecha_fin se iguale a la fecha_inicio
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

    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    formData.append("fecha_inicio", form.fecha_inicio); 
    formData.append(
      "fecha_fin",
      esMultidia ? form.fecha_fin : form.fecha_inicio
    );
    
    const { pais, estado, municipio, detalle } = locationParts;
    const direccionCompleta = `${pais}, ${estado}, ${municipio}, ${detalle}`;
    formData.append("ubicacion", direccionCompleta);

    if (form.area_conocimiento && form.area_conocimiento.length > 0) {
      form.area_conocimiento.forEach((area) => {
        formData.append("area_conocimiento", area.toUpperCase());
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
      toast({ title: "Error", description: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Planificar Actividad</Heading>
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

        <FormControl isRequired>
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
        
        {/* Checkbox para controlar la duración multidía */}
        <FormControl>
          <Checkbox isChecked={esMultidia} onChange={handleMultidiaChange} colorScheme="primary">
            La actividad se realizará durante varios días
          </Checkbox>
        </FormControl>

        {/* Renderizado condicional de las fechas */}
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
