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
  RadioGroup,
  Radio,
  HStack,
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useGlobalData } from "@/app/context/global-data-context";
import { useRouter } from "next/navigation";

// Se ha eliminado la propiedad isRequired del componente para que no la aplique.
const FileUploadControl = ({ id, label }: { id: string, label: string }) => (
  <FormControl id={id}>
    <FormLabel>{label}</FormLabel>
    <Input type="file" p={1} />
  </FormControl>
);

export const SolicitudForm = () => {
  const { userId } = useAuth();
  const { setProviderCode } = useGlobalData();
  const router = useRouter();

  const [personType, setPersonType] = useState<"natural" | "juridica" | "">("natural");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newProviderCode = "ORG123";
      setProviderCode(newProviderCode);

      toast({
        title: "Solicitud enviada.",
        description: "Hemos recibido tu solicitud y la revisaremos pronto.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push(`/`);
    } catch (error) {
      toast({
        title: "Error al enviar la solicitud.",
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
      maxW="xl"
      mx="auto"
      p={6}
      bg="white"
      rounded="lg"
      shadow="md"
    >
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="lg" textAlign="center">
          Solicitud de Inscripción
        </Heading>
        <Text fontSize="md" textAlign="center" color="gray.600">
          Completa el formulario para registrar tu organización o como facilitador.
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="person-type" as="fieldset" isRequired>
              <FormLabel as="legend">Tipo de Persona</FormLabel>
              <RadioGroup onChange={(value: "natural" | "juridica") => setPersonType(value)} value={personType}>
                <HStack spacing="24px">
                  <Radio value="natural">Persona Natural</Radio>
                  <Radio value="juridica">Persona Jurídica</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            {personType === "natural" && (
              <VStack spacing={4} align="stretch" w="full">
                <Heading size="md" pt={4}>Documentos para Persona Natural</Heading>
                <FileUploadControl id="cedula" label="Cédula de Identidad" />
                <FileUploadControl id="rif-natural" label="Registro de Información Fiscal (RIF)" />
                <FileUploadControl id="islr-natural" label="Certificados de Declaración ISLR" />
                <FileUploadControl id="cv-natural" label="Resumen curricular del facilitador(es)" />
                <FileUploadControl id="titulo-natural" label="Copia del título" />
              </VStack>
            )}

            {personType === "juridica" && (
              <VStack spacing={4} align="stretch" w="full">
                <Heading size="md" pt={4}>Documentos para Persona Jurídica</Heading>
                <FileUploadControl id="reg-mercantil" label="Registro Mercantil" />
                <FileUploadControl id="cedula-legal" label="Cédula de Identidad del representante legal" />
                <FileUploadControl id="rif-juridico" label="Registro de Información Fiscal (RIF)" />
                <FileUploadControl id="islr-juridico" label="Certificado de Declaración ISLR" />
                <FileUploadControl id="cv-juridico" label="Resumen curricular del facilitador(es)" />
                <FileUploadControl id="titulo-juridico" label="Copia del título" />
              </VStack>
            )}
            
            <Button 
              type="submit" 
              colorScheme="teal" 
              width="full" 
              isLoading={isLoading}
              loadingText="Enviando..."
              isDisabled={!personType}
            >
              Enviar Solicitud
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};