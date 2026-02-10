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
  Checkbox,
  CheckboxGroup,
  Stack,
  FormHelperText,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface ActivityItem {
  id: number;
  title: string;
  image: string;
  date_start: string;
  date_end: string;
  place: string;
  description: string;
  area?: string[];
}

interface Props {
  activity: ActivityItem | null;
}

export default function ReporteClientPage({ activity }: Props) {
  if (!activity) {
    return (
      <Box maxW="4xl" mx="auto" p={10} textAlign="center">
        <Heading size="lg">Actividad no encontrada</Heading>
        <Text mt={4}>No existe información para esta actividad.</Text>
      </Box>
    );
  }

  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "",
    place: "",
    date_start: "",
    date_end: "",
    description: "",
  });

  // Estados para campos editables
  const [numMembers, setNumMembers] = useState<number | "">("");
  const [allies, setAllies] = useState<string>("");
  const [expectedBeneficiaries, setExpectedBeneficiaries] = useState<number | "">("");
  const [actualBeneficiaries, setActualBeneficiaries] = useState<number | "">("");
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [attendeeFile, setAttendeeFile] = useState<File | null>(null);
  const [observations, setObservations] = useState<string>("");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!activity) return;

    setForm({
      title: activity.title,
      place: activity.place,
      date_start: activity.date_start,
      date_end: activity.date_end,
      description: activity.description,
    });

    setPreviewImage(activity.image);
  }, [activity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el reporte
    console.log({
      numMembers,
      allies,
      expectedBeneficiaries,
      actualBeneficiaries,
      photoFiles,
      attendeeFile,
      observations,
    });
    alert("Reporte enviado correctamente (simulado)");
  };

  return (
    <Box maxW="6xl" mx="auto" p={8} my={8} bg="white" rounded="lg" shadow="xl">
      <Heading size="2xl" mb={6} textAlign="center" color="primary">
        Reporte de Actividad
      </Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">

          {/* Información Protegida */}

          <FormControl>
            <FormLabel>Nombre de la Actividad Realizada</FormLabel>
            <Input value={activity.title} isReadOnly />
          </FormControl>

          <FormControl>
            <FormLabel>Fecha de Inicio de la Actividad</FormLabel>
            <Input value={activity.date_start || ""} isReadOnly />
          </FormControl>

          <FormControl>
            <FormLabel>Fecha de Fin de la Actividad</FormLabel>
            <Input value={activity.date_end || ""} isReadOnly />
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

          {/* Campos Editables */}
          <FormControl isRequired>
            <FormLabel>Número de Miembros del Grupo</FormLabel>
            <Input
              type="number"
              value={numMembers}
              onChange={(e) => setNumMembers(Number(e.target.value))}
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
              onChange={(e) => setExpectedBeneficiaries(Number(e.target.value))}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Número de personas realmente beneficiadas con la actividad</FormLabel>
            <Input
              type="number"
              value={actualBeneficiaries}
              onChange={(e) => setActualBeneficiaries(Number(e.target.value))}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Reporte Fotográfico</FormLabel>
            <Input
              type="file"
              multiple
              accept="image/*,video/*,.drawing"
              onChange={(e) => setPhotoFiles(e.target.files)}
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
            />
          </FormControl>

          <FormControl>
            <FormLabel>Observaciones</FormLabel>
            <Textarea
              placeholder="Ingrese observaciones adicionales"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </FormControl>

          <Divider />

          <Flex justify="flex-end" gap={4}>
            <Button colorScheme="gray" type="button" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button colorScheme="teal" type="submit">
              Enviar Reporte
            </Button>
          </Flex>

        </VStack>
      </form>
    </Box>
  );
}
