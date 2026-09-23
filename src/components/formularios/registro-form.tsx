"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
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
import { getDashboardRouteByRoles } from "@/utils/redirectByRole";
import { getRegisterErrorMessage } from "@/utils/errorMapper";

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { user } = useAuth(); 
  const router = useRouter(); 

  const formBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    if (user && user.roles) {
      const targetRoute = getDashboardRouteByRoles(user.roles);
      router.replace(targetRoute);
    }
  }, [user, router]);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "El nombre es obligatorio.";
    if (!lastName.trim()) errors.lastName = "El apellido es obligatorio.";
    
    if (!cedula.trim()) {
      errors.cedula = "La cédula es obligatoria.";
    } else if (!/^\d+$/.test(cedula.trim())) {
      errors.cedula = "La cédula debe contener solo números.";
    }

    if (!telefono.trim()) {
      errors.telefono = "El número de teléfono es obligatorio.";
    } else if (!/^\d+$/.test(telefono.trim())) {
      errors.telefono = "El teléfono debe contener solo números.";
    }

    if (!birthDate) errors.birthDate = "La fecha de nacimiento es obligatoria.";

    setFieldErrors(errors);

    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completar todos los campos de esta sección antes de continuar a la siguiente.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
    }

    return isValid;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!direccion.trim()) errors.direccion = "La dirección es obligatoria.";
    
    if (!email.trim()) {
      errors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Ingresa un correo electrónico válido.";
    }

    if (!password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setGeneralError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setGeneralError('');
    setFieldErrors({});
    setStep(1);
  };

  const formatDateToBackend = (dateString: string) => {
    if (!dateString) return "01-01-2000";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);

    try {
      const formattedDate = formatDateToBackend(birthDate);

      const formData = new FormData();
      formData.append('cedula', cedula.trim());
      formData.append('telefono', telefono.trim());
      formData.append('email', email.trim());
      formData.append('nombres', firstName.trim());
      formData.append('apellidos', lastName.trim());
      formData.append('fecha_de_nacimiento', formattedDate);
      formData.append('genero', genero);
      formData.append('nivel_educativo', nivelEducativo);
      formData.append('direccion', direccion.trim());
      formData.append('password', password);

      await apiRequest('/users', {
        method: 'POST',
        body: formData,
      });

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      router.push("/login");
    } catch (err: any) {
      const friendlyMessage = getRegisterErrorMessage(err.message);
      setGeneralError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null;
  }

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

      {generalError && (
        <Box bg="red.50" borderLeft="4px solid" borderColor="red.500" p={3} mb={4} rounded="md">
          <Text color="red.700" fontSize="sm" fontWeight="medium">
            {generalError}
          </Text>
        </Box>
      )}

      <form onSubmit={handleRegister} noValidate>
        <Stack spacing={4}>
          
          {/* PASO 1 */}
          {step === 1 && (
            <Stack spacing={4}>
              <FormControl id="firstName" isInvalid={!!fieldErrors.firstName}>
                <FormLabel>Nombre</FormLabel>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearFieldError("firstName");
                  }}
                  borderColor={inputBorderColor}
                />
                <FormErrorMessage>{fieldErrors.firstName}</FormErrorMessage>
              </FormControl>

              <FormControl id="lastName" isInvalid={!!fieldErrors.lastName}>
                <FormLabel>Apellido</FormLabel>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearFieldError("lastName");
                  }}
                  borderColor={inputBorderColor}
                />
                <FormErrorMessage>{fieldErrors.lastName}</FormErrorMessage>
              </FormControl>

              <FormControl id="cedula" isInvalid={!!fieldErrors.cedula}>
                <FormLabel>Cédula</FormLabel>
                <Input
                  type="text"
                  value={cedula}
                  onChange={(e) => {
                    setCedula(e.target.value);
                    clearFieldError("cedula");
                  }}
                  borderColor={inputBorderColor}
                  placeholder="Ej: 25123456"
                />
                <FormErrorMessage>{fieldErrors.cedula}</FormErrorMessage>
              </FormControl>

              <FormControl id="telefono" isInvalid={!!fieldErrors.telefono}>
                <FormLabel>Número de Teléfono</FormLabel>
                <Input
                  type="number"
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value);
                    clearFieldError("telefono");
                  }}
                  borderColor={inputBorderColor}
                  placeholder="Ej: 04121234567"
                />
                <FormErrorMessage>{fieldErrors.telefono}</FormErrorMessage>
              </FormControl>

              <FormControl id="birthDate" isInvalid={!!fieldErrors.birthDate}>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    clearFieldError("birthDate");
                  }}
                  borderColor={inputBorderColor}
                />
                <FormErrorMessage>{fieldErrors.birthDate}</FormErrorMessage>
              </FormControl>

              <Button onClick={handleNext} colorScheme="primary" size="lg" mt={4} w="full">
                Siguiente
              </Button>
            </Stack>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <Stack spacing={4}>
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

              <FormControl id="direccion" isInvalid={!!fieldErrors.direccion}>
                <FormLabel>Dirección</FormLabel>
                <Input
                  type="text"
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    clearFieldError("direccion");
                  }}
                  borderColor={inputBorderColor}
                />
                <FormErrorMessage>{fieldErrors.direccion}</FormErrorMessage>
              </FormControl>

              <FormControl id="email" isInvalid={!!fieldErrors.email}>
                <FormLabel>Correo Electrónico</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  borderColor={inputBorderColor}
                />
                <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>
              </FormControl>

              <FormControl id="password" isInvalid={!!fieldErrors.password}>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  borderColor={inputBorderColor}
                />
                <FormErrorMessage>{fieldErrors.password}</FormErrorMessage>
              </FormControl>

              <FormControl id="confirmPassword" isInvalid={!!fieldErrors.confirmPassword}>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  borderColor={inputBorderColor}
                />
                <FormErrorMessage>{fieldErrors.confirmPassword}</FormErrorMessage>
              </FormControl>

              <Stack direction="row" spacing={4} mt={4}>
                <Button onClick={handleBack} variant="outline" size="lg" w="50%">
                  Atrás
                </Button>
                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  w="50%"
                  isLoading={isLoading}
                >
                  Registrarse
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </form>

      <Text mt={6} textAlign="center" fontSize="sm" color="gray.600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" color="secondary.500" fontWeight="bold">
          Inicia Sesión
        </Link>
      </Text>
    </Box>
  );
};