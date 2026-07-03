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

export default function CrearActividadForm() {
  const router = useRouter();
  const toast = useToast();
  const { user, isHydrated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Se adaptan las claves al español para que coincidan con la API
  const [form, setForm] = useState({
    nombre: "",
    location: "",
    fecha: "",
    descripcion: "",
    area_conocimiento: [] as string[],
    financiamiento: "",
    financing_org: ""
  });

  // Estado local recuperado para dividir la ubicación (Tu versión anterior)
  const [locationParts, setLocationParts] = useState({
    pais: "",
    estado: "",
    municipio: "",
    detalle: ""
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Efecto recuperado: Junta las partes y actualiza la clave 'location' que espera el backend
  useEffect(() => {
    const { pais, estado, municipio, detalle } = locationParts;
    if (pais || estado || municipio || detalle) {
      const fullAddress = `${pais}, ${estado}, ${municipio}, ${detalle}`;
      setForm(prev => ({ ...prev, location: fullAddress }));
    }
  }, [locationParts]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Manejador recuperado para las partes de la ubicación
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
    // 🛡️ Validación estricta del Group ID usando el auth-context
    if (!isHydrated) return;

    if (!user?.groupId) {
      toast({
        title: "Identificación de Grupo Requerida",
        description: "La actividad no se pudo crear, ¡no pudimos identificar tu grupo! Por favor contacta al administrador para solucionar este problema.",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    Object.keys(form).forEach(key => {
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

    if (imageFile) formData.append("reporte", imageFile);

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
          
          <Text fontSize="xs" color="gray.500" mb={3} lineHeight="tall" bg="teal.50/50" p={2} borderRadius="md" borderLeft="3px solid" borderColor="teal.400">
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

        {/* Bloque de ubicación */}
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

        <Box 
            width="100%" 
            height="1px" 
            bg="gray.200" 
            mx="auto" 
            my={2} 
            borderRadius="full" 
        />

        <FormControl isRequired>
          <FormLabel>Fecha</FormLabel>
          <Input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>ÁREA DE CONOCIMIENTO </FormLabel>
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
            colorScheme="green" 
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