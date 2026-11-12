"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { PrimaryButton } from "@/components/ui/buttons";
import { getPasswordErrorMessage } from "@/utils/errorMapper";

const MIN_LENGTH = 8; // El mismo mínimo que exige el backend.

type Field = "actual" | "nueva" | "confirmacion";

// Cada usuario cambia solo su propia contraseña (PUT /auth/password usa el token de la sesión).
export const CambiarContrasenaForm = () => {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [values, setValues] = useState<Record<Field, string>>({ actual: "", nueva: "", confirmacion: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [show, setShow] = useState<Record<Field, boolean>>({ actual: false, nueva: false, confirmacion: false });
  const [isSaving, setIsSaving] = useState(false);

  const formBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    if (isHydrated && !user) router.replace("/login");
  }, [isHydrated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation: Partial<Record<Field, string>> = {};
    if (!values.actual) validation.actual = "Ingresa tu contraseña actual.";
    if (values.nueva.length < MIN_LENGTH) validation.nueva = `La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres.`;
    if (values.confirmacion !== values.nueva) validation.confirmacion = "Las contraseñas no coinciden.";
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSaving(true);
    try {
      await apiRequest("auth/password", {
        method: "PUT",
        body: JSON.stringify({ passwordActual: values.actual, passwordNueva: values.nueva }),
      });
      toast({ title: "Contraseña actualizada.", status: "success", duration: 3000, isClosable: true });
      router.push("/perfil");
    } catch (err: any) {
      const raw = String(err?.message || "").trim().toLowerCase();
      if (raw === "contraseña actual incorrecta") {
        setErrors({ actual: getPasswordErrorMessage(raw) });
      } else {
        toast({
          title: "No se pudo cambiar la contraseña",
          description: getPasswordErrorMessage(err?.message),
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || !user) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner color="primary.500" />
      </Flex>
    );
  }

  const passwordField = (name: Field, label: string, helper?: string) => (
    <FormControl id={name} isRequired isInvalid={!!errors[name]}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Input
          type={show[name] ? "text" : "password"}
          name={name}
          value={values[name]}
          onChange={handleChange}
          autoComplete={name === "actual" ? "current-password" : "new-password"}
          borderColor={inputBorderColor}
        />
        <InputRightElement h="full">
          <IconButton
            aria-label={show[name] ? "Ocultar contraseña" : "Mostrar contraseña"}
            icon={show[name] ? <ViewOffIcon /> : <ViewIcon />}
            variant="ghost"
            size="sm"
            onClick={() => setShow((prev) => ({ ...prev, [name]: !prev[name] }))}
          />
        </InputRightElement>
      </InputGroup>
      {errors[name]
        ? <FormErrorMessage>{errors[name]}</FormErrorMessage>
        : helper && <FormHelperText>{helper}</FormHelperText>}
    </FormControl>
  );

  return (
    <Box bg={formBgColor} p={{ base: 6, md: 8 }} rounded="xl" boxShadow="lg" borderWidth="1px" w="full" maxW="md" mx="auto">
      <Heading as="h1" size="lg" mb={6}>
        Cambiar contraseña
      </Heading>

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={5}>
          {passwordField("actual", "Contraseña actual")}
          {passwordField("nueva", "Nueva contraseña", `Mínimo ${MIN_LENGTH} caracteres.`)}
          {passwordField("confirmacion", "Confirmar nueva contraseña")}

          <HStack justify="flex-end" spacing={3} pt={4}>
            <Button as={NextLink} href="/perfil" variant="ghost">
              Cancelar
            </Button>
            <PrimaryButton type="submit" size="md" isLoading={isSaving} loadingText="Guardando...">
              Cambiar contraseña
            </PrimaryButton>
          </HStack>
        </Stack>
      </form>
    </Box>
  );
};
