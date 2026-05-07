// components/ui/course-evaluation-form.tsx

"use client";

import React from 'react';
import { 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  VStack, 
  Textarea, 
  Box, 
  Link,
  useColorModeValue,
  Text,
  Heading, // 🛑 Agregamos Heading para el título
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

// Define las props que CourseEvaluationForm necesita
interface CourseEvaluationFormProps {
  // Estado que capturaremos en AdminActions
  calificacion: string;
  setCalificacion: (value: string) => void;
  observacionesEvaluacion: string;
  setObservacionesEvaluacion: (value: string) => void;
  
  // URL del archivo de rúbrica pública
  rubricaUrl: string; 
  
  // Manejo del archivo de prueba
  onFileChange: (file: File | null) => void;
}

export function CourseEvaluationForm({ 
  calificacion,
  setCalificacion,
  observacionesEvaluacion,
  setObservacionesEvaluacion,
  rubricaUrl,
  onFileChange,
}: CourseEvaluationFormProps) {
  
  // Handler simple para simular la selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };
  
  // 🎨 ESTILOS ARMONIZADOS (Similares a categorias-cursos.tsx)
  const containerBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("teal.600", "teal.300"); // Usamos Teal para el encabezado
  const inputBg = useColorModeValue('white', 'gray.800');
  const inputBorder = useColorModeValue('gray.200', 'gray.600');

  return (
    <VStack 
      spacing={4} 
      align="stretch" 
      p={6} 
      rounded="lg" // Borde redondeado
      borderWidth="1px" // Borde sutil
      borderColor={useColorModeValue('gray.200', 'gray.600')} // Color de borde neutro
      shadow="md" // Sombra
      bg={containerBg} // Fondo blanco/gris oscuro
    >
      <Heading 
        as="h3" 
        size="lg" 
        mb={2} 
        color={headingColor}
      >
        Formulario de Evaluación Final de Curso
      </Heading>

      <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} mb={4}>
        Complete los campos requeridos para finalizar la revisión y **Aprobar** el curso.
      </Text>
      
      {/* 1. RÚBRICA DE DESCARGA */}
      <Box>
        <Text mb={2} fontWeight="semibold">Documento de Referencia:</Text>
        <Button 
          as={Link}
          href={rubricaUrl}
          isExternal 
          colorScheme="teal" // 🛑 Cambiamos a teal para armonizar
          leftIcon={<DownloadIcon />}
          size="md" // Tamaño mediano
        >
          Descargar Rúbrica de Evaluación
        </Button>
      </Box>

      {/* 2. INPUT DE CALIFICACIÓN OBLIGATORIO */}
      <FormControl isRequired pt={2}>
        <FormLabel fontWeight="bold">Calificación Obtenida (Ej: Aprobado / 85%)</FormLabel>
        <Input
          value={calificacion}
          onChange={(e) => setCalificacion(e.target.value)}
          placeholder="Ingrese la calificación final"
          bg={inputBg}
          borderColor={inputBorder}
        />
      </FormControl>

      {/* 3. SUBIDA DE ARCHIVO DE PRUEBA (EVIDENCIA) */}
      <FormControl isRequired>
        <FormLabel fontWeight="bold">Subir Archivo de Prueba/Evidencia</FormLabel>
        <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} mb={1}>
          Documento (PDF o ZIP) que justifique la calificación otorgada.
        </Text>
        <Input 
          type="file" 
          p={1} 
          onChange={handleFileSelect}
          bg={inputBg}
          borderColor={inputBorder}
        />
      </FormControl>

      {/* 4. OBSERVACIONES OPCIONALES */}
      <FormControl>
        <FormLabel fontWeight="bold">Observaciones de la Evaluación (Opcional)</FormLabel>
        <Textarea
          value={observacionesEvaluacion}
          onChange={(e) => setObservacionesEvaluacion(e.target.value)}
          placeholder="Observaciones adicionales sobre la evaluación."
          bg={inputBg}
          borderColor={inputBorder}
        />
      </FormControl>
    </VStack>
  );
}