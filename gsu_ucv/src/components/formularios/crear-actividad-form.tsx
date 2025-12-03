"use client";

import React, { useState } from "react";
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
  useToast
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

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    console.log("Imagen:", imageFile);

    toast({
      title: "Actividad creada (mock)",
      description: "Esto solo simula la creación de la actividad.",
      status: "success",
      duration: 2000,
    });

    router.push("/admingroup/nuestras_actividades");
  };

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Crear Actividad</Heading>

      <VStack spacing={5} align="stretch">

        <FormControl isRequired>
          <FormLabel>Título de la Actividad</FormLabel>
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Simulación ONU Junior"
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

        <FormControl isRequired>
          <FormLabel>Lugar</FormLabel>
          <Input
            name="place"
            value={form.place}
            onChange={handleChange}
            placeholder="Ej: Aula Magna"
          />
        </FormControl>

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

        <FormControl isRequired>
          <FormLabel>Financiamiento</FormLabel>
          <Select name="financiamiento" value={form.financiamiento} onChange={handleChange}>
            <option value="">Seleccione...</option>
            <option value="SI">SI</option>
            <option value="NO">NO</option>
        </Select>
        </FormControl>

        {form.financiamiento.includes("SI") && (
            <FormControl isRequired>
            <FormLabel>Organización Financiadora</FormLabel>
            <Input
                name="otrosActividad"
                value={form.organizacionFinanvia}
                onChange={handleChange}
                placeholder="Organización"
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
          <Button colorScheme="gray" onClick={() => router.back()}>
            Cancelar
          </Button>

          <Button colorScheme="green" onClick={handleCreate}>
            Crear Actividad
          </Button>
        </Flex>

      </VStack>
    </Box>
  );
}
