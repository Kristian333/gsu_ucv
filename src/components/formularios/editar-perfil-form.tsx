"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Select,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { apiRequest } from "@/components/formularios/api";
import { PrimaryButton } from "@/components/ui/buttons";
import { genderOptions, educationOptions } from "@/constants/user-options";
import { getDashboardRouteByRoles } from "@/utils/redirectByRole";
import { getUserErrorMessage } from "@/utils/errorMapper";

type ProfileForm = {
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  fecha_de_nacimiento: string; // YYYY-MM-DD, el formato del input date
  genero: string;
  nivel_educativo: string;
  direccion: string;
};

type FieldErrors = Partial<Record<keyof ProfileForm, string>>;

const emptyForm: ProfileForm = {
  nombres: "",
  apellidos: "",
  cedula: "",
  email: "",
  fecha_de_nacimiento: "",
  genero: "",
  nivel_educativo: "",
  direccion: "",
};

// La API usa DD-MM-YYYY y el input date YYYY-MM-DD: invertir el orden sirve en ambos sentidos.
const swapDateParts = (date: string) => date.split("-").reverse().join("-");

// Convierte la respuesta de GET/PUT /users/:id a los valores del formulario.
function toForm(user: any): ProfileForm {
  return {
    nombres: user?.nombres || "",
    apellidos: user?.apellidos || "",
    cedula: user?.cedula || "",
    email: user?.email || "",
    fecha_de_nacimiento: user?.fecha_de_nacimiento ? swapDateParts(user.fecha_de_nacimiento) : "",
    genero: user?.genero || "",
    nivel_educativo: user?.nivel_educativo || "",
    direccion: user?.direccion || "",
  };
}

function validate(form: ProfileForm, initial: ProfileForm): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
  if (!form.apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
  if (!form.email.trim()) errors.email = "El correo electrónico es obligatorio.";
  if (!/^\d+$/.test(form.cedula.trim()) || Number(form.cedula) <= 0) {
    errors.cedula = "La cédula debe ser un número.";
  }
  if (!form.fecha_de_nacimiento && initial.fecha_de_nacimiento) {
    errors.fecha_de_nacimiento = "La fecha de nacimiento no puede quedar vacía.";
  }
  return errors;
}

interface EditarPerfilFormProps {
  // Usuario a editar; si se omite, el de la sesión.
  userId?: string;
  // A dónde volver al cancelar o al guardar; si se omite, se queda en la página.
  returnTo?: string;
}

export const EditarPerfilForm = ({ userId, returnTo }: EditarPerfilFormProps) => {
  const { user, isHydrated, login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [initial, setInitial] = useState<ProfileForm>(emptyForm);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const formBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");

  const targetId = userId || user?.id || "";
  const isOwnProfile = !!user && String(user.id) === String(targetId);
  const roles = (user?.roles || []).map((r) => r.toLowerCase().trim());
  const isGlobalAdmin = roles.includes("root") || roles.includes("deu_admin");
  const backHref = returnTo || getDashboardRouteByRoles(user?.roles || []);

  // Solo el propio usuario o un administrador de la DEU pueden editar el perfil.
  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isOwnProfile && !isGlobalAdmin) {
      router.replace(getDashboardRouteByRoles(user.roles));
      return;
    }

    apiRequest(`users/${targetId}`)
      .then((data) => {
        const values = toForm(data);
        setInitial(values);
        setForm(values);
        setIsLoading(false);
      })
      .catch((err) => {
        toast({
          title: "No se pudo cargar el perfil",
          description: getUserErrorMessage(err?.message),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.replace(backHref);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, user?.id, targetId]);

  // Un género guardado que no está en la lista se conserva como opción.
  const genders = form.genero && !genderOptions.some((o) => o.value === form.genero)
    ? [...genderOptions, { value: form.genero, label: form.genero }]
    : genderOptions;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validate(form, initial);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    // PUT /users/:id es una actualización parcial: solo se envía lo que cambió.
    const data = new FormData();
    (Object.keys(form) as (keyof ProfileForm)[]).forEach((key) => {
      const value = form[key].trim();
      if (value === initial[key]) return;
      data.append(key, key === "fecha_de_nacimiento" ? swapDateParts(value) : value);
    });

    if (Array.from(data.keys()).length === 0) {
      toast({ title: "No hay cambios para guardar.", status: "info", duration: 3000, isClosable: true });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await apiRequest(`users/${targetId}`, { method: "PUT", body: data });
      const values = toForm(updated);
      setInitial(values);
      setForm(values);

      // El nombre y el correo de la sesión se muestran en los paneles.
      if (isOwnProfile && user) {
        login({ ...user, name: `${values.nombres} ${values.apellidos}`, correo: values.email });
      }

      toast({ title: "Perfil actualizado.", status: "success", duration: 3000, isClosable: true });

      if (returnTo) {
        router.push(returnTo);
        router.refresh();
      }
    } catch (err: any) {
      toast({
        title: "No se pudo actualizar el perfil",
        description: getUserErrorMessage(err?.message),
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner color="primary.500" />
        <Text ml={4}>Cargando perfil...</Text>
      </Flex>
    );
  }

  const textField = (name: keyof ProfileForm, label: string, type = "text", isRequired = false) => (
    <FormControl id={name} isRequired={isRequired} isInvalid={!!errors[name]}>
      <FormLabel>{label}</FormLabel>
      <Input type={type} name={name} value={form[name]} onChange={handleChange} borderColor={inputBorderColor} />
      {errors[name] && <FormErrorMessage>{errors[name]}</FormErrorMessage>}
    </FormControl>
  );

  return (
    <Box bg={formBgColor} p={{ base: 6, md: 8 }} rounded="xl" boxShadow="lg" borderWidth="1px" w="full" maxW="2xl" mx="auto">
      <Heading as="h1" size="lg" mb={2}>
        {isOwnProfile ? "Mi perfil" : "Editar usuario"}
      </Heading>
      {!isOwnProfile && (
        <Text mb={2} color="gray.500">Estás editando los datos de otro usuario como administrador.</Text>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={4} mt={6}>
          {textField("nombres", "Nombres", "text", true)}
          {textField("apellidos", "Apellidos", "text", true)}
          {textField("cedula", "Cédula", "text", true)}
          {textField("email", "Correo electrónico", "email", true)}
          {textField("fecha_de_nacimiento", "Fecha de nacimiento", "date")}

          <FormControl id="genero">
            <FormLabel>Género</FormLabel>
            <Select name="genero" value={form.genero} onChange={handleChange} placeholder="Selecciona el género" borderColor={inputBorderColor}>
              {genders.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormControl>

          <FormControl id="nivel_educativo">
            <FormLabel>Nivel educativo</FormLabel>
            <Select
              name="nivel_educativo"
              value={form.nivel_educativo}
              onChange={handleChange}
              placeholder={form.nivel_educativo ? undefined : "Selecciona el nivel educativo"}
              borderColor={inputBorderColor}
            >
              {educationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormControl>

          {textField("direccion", "Dirección")}

          {isOwnProfile && form.email.trim() !== initial.email && (
            <Text fontSize="sm" color="orange.500">
              El correo es tu usuario para iniciar sesión: después de guardar, entra con el nuevo correo.
            </Text>
          )}

          <Flex justify="space-between" align="center" wrap="wrap" gap={3} pt={4}>
            {isOwnProfile ? (
              <Link as={NextLink} href="/perfil/contrasena" color="secondary.500" fontWeight="bold">
                Cambiar contraseña
              </Link>
            ) : <Box />}
            <HStack spacing={3}>
              <Button as={NextLink} href={backHref} variant="ghost">
                {returnTo ? "Cancelar" : "Volver"}
              </Button>
              <PrimaryButton type="submit" size="md" isLoading={isSaving} loadingText="Guardando...">
                Guardar cambios
              </PrimaryButton>
            </HStack>
          </Flex>
        </Stack>
      </form>
    </Box>
  );
};
