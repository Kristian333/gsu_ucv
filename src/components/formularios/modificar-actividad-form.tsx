"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Image,
  Heading,
  VStack,
  useToast
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function ModificarActividadForm({ actividad }) {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    title: actividad.title,
    place: actividad.place,
    date_start: actividad.date_start,
    date_end: actividad.date_end,
    description: actividad.description ?? "",
    image: actividad.image,
  });

  const [previewImage, setPreviewImage] = useState(`${actividad.image}`);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    toast({
      title: "Cambios guardados (mock)",
      description: "Esto solo modifica la data mockeada temporalmente.",
      status: "success",
      duration: 2000
    });

    router.push("/admingroup/nuestras_actividades");
  };

  return (
    <Box maxW="700px" mx="auto" mt={10} p={8} borderRadius="lg" bg="white" shadow="md">
      <Heading mb={6}>Modificar Actividad</Heading>

      <VStack spacing={5} align="stretch">

        <FormControl>
          <FormLabel>Título</FormLabel>
          <Input name="title" value={form.title} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Lugar</FormLabel>
          <Input name="place" value={form.place} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Fecha inicio</FormLabel>
          <Input type="date" name="date_start" value={form.date_start} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Fecha fin</FormLabel>
          <Input type="date" name="date_end" value={form.date_end} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Imagen actual</FormLabel>
          <Image
            src={previewImage}
            alt="Preview"
            borderRadius="md"
            maxH="250px"
            objectFit="cover"
            mb={3}
          />
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </FormControl>

        <Flex justify="space-between" mt={7}>
          <Button colorScheme="gray" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button colorScheme="teal" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </Flex>

      </VStack>
    </Box>
  );
}
