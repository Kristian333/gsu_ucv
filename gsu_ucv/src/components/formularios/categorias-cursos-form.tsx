// components/admin/categorias-cursos.tsx
"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Radio, 
  RadioGroup, 
  Stack, 
  Select, 
  FormLabel, 
  FormControl, 
  useColorModeValue,
  Text,
} from '@chakra-ui/react';

// Lista de facultades de ejemplo para el Select
const FACULTADES_MOCK = [
  { id: 'ing', name: 'Facultad de Ingeniería' },
  { id: 'cien', name: 'Facultad de Ciencias y Tecnología' },
  { id: 'hum', name: 'Facultad de Humanidades y Artes' },
  { id: 'salud', name: 'Facultad de Ciencias de la Salud' },
];

export function CourseClassificationForm() {
  const [clasificacion, setClasificacion] = useState('');
  const [facultad, setFacultad] = useState('');

  // Define la opción que activa el select de facultades
  const CLASIFICACION_REQUIERE_FACULTAD = 'Formación para el mejoramiento técnico/profesional';

  // Opciones de clasificación
  const opcionesClasificacion = [
    { value: 'Formación para todo público', description: 'Actividades formativas dirigidos a explorar de manera general algún área de conocimiento y que no requieran un perfíl de ingreso técnico ni profesional.' },
    { value: 'Formación para el trabajo', description: 'Actividades formativas cuyo objetivo es la profesionalización de algún oficio a través del desarrollo de competencias específicas.' },
    { value: 'Formación para toda la vida', description: 'Actividades formativas cuyo objetivo es brindar competencias y herramientas personales útiles en diversos contextos.' },
    { value: CLASIFICACION_REQUIERE_FACULTAD, description: 'Actividades formativas cuyo contenido profundiza en áreas técnicas y profesionales para las que se requiere un nivel profesional en el perfil de ingreso.' },
  ];

  const containerBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("teal.600", "teal.300");

  return (
    <Box 
      p={6} 
      borderWidth="1px" 
      borderRadius="lg" 
      shadow="md" 
      bg={containerBg} 
      mb={8}
    >
      <Heading as="h3" size="lg" mb={4} color={headingColor}>
        Clasificación Administrativa del Curso
      </Heading>

      <RadioGroup onChange={setClasificacion} value={clasificacion}>
        <Stack direction="column" spacing={4}>
          {opcionesClasificacion.map((op) => (
            <Radio key={op.value} value={op.value} size="lg">
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold">{op.value}</Text>
                <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>{op.description}</Text>
              </VStack>
            </Radio>
          ))}
        </Stack>
      </RadioGroup>

      {/* SECCIÓN CONDICIONAL: Solo visible si requiere remisión a facultad */}
      {clasificacion === CLASIFICACION_REQUIERE_FACULTAD && (
        <FormControl mt={6} isRequired>
          <FormLabel fontWeight="bold">Remitir a Facultad</FormLabel>
          <Select 
            placeholder="Selecciona la facultad de revisión"
            value={facultad}
            onChange={(e) => setFacultad(e.target.value)}
          >
            {FACULTADES_MOCK.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
        </FormControl>
      )}
      
      {/* Opcional: Mostrar el valor seleccionado para debugging/UX */}
      {/* <Text mt={4} fontSize="sm">Clasificación actual: {clasificacion}</Text> */}
    </Box>
  );
}