"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Image,
  Heading,
  VStack,
  useToast,
  SimpleGrid,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function CrearActividadForm() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "",
    place: "",
    date_start: "",
    date_end: "",
    description: "",
    financiamiento: "",
    organizacionFinanvia: ""
  });

  // Estado local para las partes de la ubicación
  const [location, setLocation] = useState({
    pais: "",
    estado: "",
    municipio: "",
    detalle: ""
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Actualizar el campo 'place' cada vez que cambie alguna parte de la ubicación
  useEffect(() => {
    const { pais, estado, municipio, detalle } = location;
    const fullAddress = `${pais}, ${estado}, ${municipio}, ${detalle}`;
    setForm(prev => ({ ...prev, place: fullAddress }));
  }, [location]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e) => {
    setLocation({ ...location, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    // Aquí se haría el POST real hacia una API
    console.log("Creando actividad:", form);

    toast({
      title: "Actividad creada (mock)",
      description: "Esto solo simula la creación de la actividad.",
      status: "success",
      duration: 3000,
    });

    router.push("/admingroup/nuestras_actividades");
  };

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Planificar Actividad</Heading>

      <VStack spacing={5} align="stretch">

        <FormControl isRequired>
          <FormLabel>Título de la Actividad</FormLabel>
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Nombre de Actividad"
          />
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

          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </FormControl>

        <Box border="1px" borderColor="gray.100" p={4} borderRadius="md" bg="gray.50">
          <Heading size="sm" mb={4} >Ubicación de la Actividad*</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">País</FormLabel>
              <Input 
                name="pais" 
                bg="white"
                value={location.pais} 
                onChange={handleLocationChange} 
                placeholder="Ej: Venezuela" 
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontSize="sm">Estado</FormLabel>
              <Input 
                name="estado" 
                bg="white"
                value={location.estado} 
                onChange={handleLocationChange} 
                placeholder="Ej: Carabobo" 
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Municipio</FormLabel>
              <Input 
                name="municipio" 
                bg="white"
                value={location.municipio} 
                onChange={handleLocationChange} 
                placeholder="Ej: Valencia" 
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Dirección Específica</FormLabel>
              <Input 
                name="detalle" 
                bg="white"
                value={location.detalle} 
                onChange={handleLocationChange} 
                placeholder="Ej: Av. Bolívar, Edif. X" 
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Box 
            width="100%" 
            height="1px" 
            bg="primary" 
            mx="auto" 
            my={0} 
            borderRadius="full" 
        />

        <SimpleGrid columns={2} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Fecha Inicio</FormLabel>
            <Input
              type="date"
              name="date_start"
              value={form.date_start}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Fecha Fin</FormLabel>
            <Input
              type="date"
              name="date_end"
              value={form.date_end}
              onChange={handleChange}
            />
          </FormControl>
        </SimpleGrid>

        <Box 
            width="100%" 
            height="1px" 
            bg="primary" 
            mx="auto" 
            my={0} 
            borderRadius="full" 
        />

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
                name="organizacionFinanvia"
                value={form.organizacionFinanvia}
                onChange={handleChange}
                placeholder="Nombre de la organización"
            />
            </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe la actividad..."
            rows={5}
          />
        </FormControl>

        <Flex justify="space-between" mt={7}>
          <Button variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>

          <Button colorScheme="teal" onClick={handleCreate}>
            Crear Actividad
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
