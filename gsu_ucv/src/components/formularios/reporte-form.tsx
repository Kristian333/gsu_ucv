"use client";

import React, { useState } from "react";
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
} from "@chakra-ui/react";

interface ActivityItem {
  id: number;
  title: string;
  group?: string;
  date_start?: string;
  date_end?: string;
  place?: string;
  description?: string;
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

  // Estados para campos editables
  const [numMembers, setNumMembers] = useState<number | "">("");
  const [allies, setAllies] = useState<string>("");
  const [expectedBeneficiaries, setExpectedBeneficiaries] = useState<number | "">("");
  const [actualBeneficiaries, setActualBeneficiaries] = useState<number | "">("");
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [attendeeFile, setAttendeeFile] = useState<File | null>(null);
  const [observations, setObservations] = useState<string>("");

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
            <FormLabel>Nombre del Grupo</FormLabel>
            <Input value={activity.group || ""} isReadOnly />
          </FormControl>

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

          <FormControl>
            <FormLabel>Lugar de la Ejecución de la Actividad</FormLabel>
            <Input value={activity.place || ""} isReadOnly />
          </FormControl>

          <FormControl>
            <FormLabel>Breve Descripción de la Actividad</FormLabel>
            <Textarea value={activity.description || ""} isReadOnly />
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
            <FormLabel>Área de Conocimiento de la Actividad</FormLabel>
            <CheckboxGroup value={activity.area || []} isDisabled>
                <Stack spacing={2}>
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
                ].map((areaOption) => (
                    <Checkbox key={areaOption} value={areaOption}>
                    {areaOption}
                    </Checkbox>
                ))}
                </Stack>
            </CheckboxGroup>
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
