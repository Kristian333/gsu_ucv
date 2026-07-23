"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Link,
  useColorModeValue,
  Text,
  useToast,
  Select,
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/formularios/api";

export const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState(''); 
  const [birthDate, setBirthDate] = useState(''); 
  const [genero, setGenero] = useState('masculino');
  const [nivelEducativo, setNivelEducativo] = useState('universitaria_incompleta');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { login } = useAuth(); 
  const router = useRouter(); 

  const formBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const formatDateToBackend = (dateString: string) => {
    if (!dateString) return "01-01-2000";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const formattedDate = formatDateToBackend(birthDate);
      const data = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          cedula: cedula,
          email: email,
          nombres: firstName,
          apellidos: lastName,
          fecha_de_nacimiento: formattedDate,
          genero: genero,
          nivel_educativo: nivelEducativo,
          direccion: direccion,
          password: password
        }),
      });

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada.",
        status: "success",
        duration: 3000,
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        login(data.user);
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      bg={formBgColor}
      p={8}
      rounded="lg"
      shadow="md"
      w="full"
      maxW="sm"
      mx="500px"
    >
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        Crear Cuenta
      </Heading>
      <form onSubmit={handleRegister}>
        <Stack spacing={4}>
          
          {/* PASO 1 */}
          <Stack spacing={4} display={step === 1 ? "flex" : "none"}>
            <FormControl id="firstName">
              <FormLabel>Nombre</FormLabel>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required={step === 1}
                borderColor={inputBorderColor}
              />
            </FormControl>
            <FormControl id="lastName">
              <FormLabel>Apellido</FormLabel>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required={step === 1}
                borderColor={inputBorderColor}
              />
            </FormControl>
            <FormControl id="cedula">
              <FormLabel>Cédula</FormLabel>
              <Input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required={step === 1}
                borderColor={inputBorderColor}
              />
            </FormControl>
            <FormControl id="telefono">
              <FormLabel>Número de Teléfono</FormLabel>
              <Input
                type="number"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required={step === 1}
                borderColor={inputBorderColor}
              />
            </FormControl>
            <FormControl id="birthDate">
              <FormLabel>Fecha de Nacimiento</FormLabel>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required={step === 1}
                borderColor={inputBorderColor}
              />
            </FormControl>
          </Stack>

          {/* PASO 2 */}
          <Stack spacing={4} display={step === 2 ? "flex" : "none"}>
            <FormControl id="genero">
              <FormLabel>Género</FormLabel>
              <Select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                borderColor={inputBorderColor}
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </Select>
            </FormControl>
            <FormControl id="nivelEducativo">
              <FormLabel>Nivel Educativo</FormLabel>
              <Select
                value={nivelEducativo}
                onChange={(e) => setNivelEducativo(e.target.value)}
                borderColor={inputBorderColor}
              >
                <option value="universitaria_incompleta">Universitaria Incompleta</option>
                <option value="universitaria_completa">Universitaria Completa</option>
                <option value="secundaria">Secundaria</option>
                <option value="primaria">Primaria</option>
              </Select>
            </FormControl>
            <FormControl id="direccion">
              <FormLabel>Dirección</FormLabel>
              <Input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required={step === 2}
                borderColor={inputBorderColor}
              />
            </FormControl>
            <FormControl id="email">
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={step === 2}
                borderColor={inputBorderColor}
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={step === 2}
                borderColor={inputBorderColor}
              />
            </FormControl>
            <FormControl id="confirmPassword">
              <FormLabel>Confirmar Contraseña</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={step === 2}
                borderColor={inputBorderColor}
              />
              {error && <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>}
            </FormControl>
          </Stack>

        </Stack>

        <Stack direction="row" spacing={4} mt={6} justify="center">
          {step > 1 && (
            <Button onClick={handleBack} variant="outline" size="lg" mt={4} >
              Atrás
            </Button>
          )}
          {step < 2 && (
            <Button onClick={handleNext} colorScheme="teal" size="lg" mt={4} w="full">
              Siguiente
            </Button>
          )}
          {step === 2 && (
            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              mt={4}
              w="full"
              isLoading={isLoading}
            >
              Registrarse
            </Button>
          )}
        </Stack>
      </form>

      <Text mt={6} textAlign="center" fontSize="sm" color="gray.600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" color="teal.500" fontWeight="bold">
          Inicia Sesión
        </Link>
      </Text>
    </Box>
  );
};