"use client";

import React, { useState, ChangeEvent } from "react";
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
import { apiRequest } from "@/components/formularios/api";

export default function CrearActividadForm() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Se adaptan las claves al español para que coincidan con la API
  const [form, setForm] = useState({
    nombre: "",           
    location: "",       
    fecha: "",           
    descripcion: "",
    financiamiento: "",      
    financing_org: ""   
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    setLoading(true);
    const formData = new FormData();
    
    Object.keys(form).forEach(key => {
      const value = form[key as keyof typeof form];
      if (value !== "" && value !== null) {
        formData.append(key, value);
      }
    });

    const storedGroupId = localStorage.getItem("group_id");
    
    if (storedGroupId && storedGroupId !== "string" && !isNaN(Number(storedGroupId))) {
      formData.append("group_id", String(parseInt(storedGroupId, 10)));
    } else {
      formData.append("group_id", "1"); 
    }

    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await apiRequest('activities', { 
        method: 'POST',
        body: formData
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
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Ej: Aula Magna"
          />
        </FormControl>

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
            isLoading={loading}
            loadingText="Creando..."
          >
            Crear Actividad
          </Button>
        </Flex>

      </VStack>
    </Box>
  );
}