// components/formularios/CourseForm.tsx
"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useGlobalData } from "@/app/context/global-data-context";
import { useRouter } from "next/navigation";

const CourseFormControl = ({ id, label, isRequired = true, isTextArea = false }: { 
  id: string; 
  label: string; 
  isRequired?: boolean; 
  isTextArea?: boolean; 
}) => {
  return (
    <FormControl id={id} isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      {isTextArea ? (
        <Textarea name={id} placeholder={`Escribe el ${label.toLowerCase()} aquí...`} />
      ) : (
        <Input type="text" name={id} placeholder={`Escribe el ${label.toLowerCase()} aquí...`} />
      )}
    </FormControl>
  );
};

export const CourseForm = () => {
  const { userId } = useAuth();
  const { providerCode, addCourse } = useGlobalData();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(true);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    // 💥 The Fix: Generate a unique ID before creating the object.
    const newCourseId = Date.now().toString();

    const courseData = {
      id: newCourseId, // <-- Add the generated ID here
      denominacion: formData.get('denominacion') as string,
      proposito: formData.get('proposito') as string,
      fundamentacion: formData.get('fundamentacion') as string,
      duracion: formData.get('duracion') as string,
      estructuraCostos: formData.get('estructura-costos') as string,
      perfilDocente: formData.get('perfil-docente') as string,
      perfiles: formData.get('perfiles') as string,
      exigencias: formData.get('exigencias') as string,
      estructuraCurricular: formData.get('estructura-curricular') as string,
      evaluacion: formData.get('evaluacion') as string,
      cronograma: formData.get('cronograma') as string,
      providerCode,
      userId,
    };

    console.log(courseData);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      addCourse(courseData); // <-- Now this works correctly

      toast({
        title: "Curso formulado.",
        description: "Tu propuesta de curso ha sido enviada con éxito.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push(`/`);
    } catch (error) {
      toast({
        title: "Error al formular el curso.",
        description: "Por favor, inténtalo de nuevo más tarde.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      maxW="2xl"
      mx="auto"
      p={6}
      my={8}
      bg="white"
      rounded="lg"
      shadow="md"
    >
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="teal.600">
          Formulación de un Nuevo Curso
        </Heading>
        <Text fontSize="lg" textAlign="center" color="gray.600">
          Completa los siguientes campos para proponer un nuevo programa de formación.
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <CourseFormControl id="denominacion" label="Denominación" isRequired={!isTesting} />
            <CourseFormControl id="proposito" label="Propósito" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="fundamentacion" label="Fundamentación" isTextArea isRequired={!isTesting} />
            
            <Divider my={4} />

            <CourseFormControl id="duracion" label="Duración (en horas)" isRequired={!isTesting} />
            <CourseFormControl id="estructura-costos" label="Estructura de costos" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="perfil-docente" label="Perfil del docente o facilitador" isTextArea isRequired={!isTesting} />

            <Divider my={4} />

            <CourseFormControl id="perfiles" label="Perfiles de ingreso y egreso de los participantes" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="exigencias" label="Exigencias en materiales y servicios" isTextArea isRequired={!isTesting} />
            
            <Divider my={4} />

            <CourseFormControl id="estructura-curricular" label="Estructura curricular por competencias" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="evaluacion" label="Estrategias de evaluación" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="cronograma" label="Cronograma de ejecución anual" isTextArea isRequired={!isTesting} />

            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              mt={6}
              isLoading={isLoading}
              loadingText="Enviando..."
            >
              Enviar Formulación
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default CourseForm;