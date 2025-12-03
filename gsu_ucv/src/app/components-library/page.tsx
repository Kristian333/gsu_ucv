import {
  Box,
  Divider,
  VStack,
  HStack,
  Stack,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import {
  Heading,
  Paragraph,
  Label,
  Link,
} from "@/components/ui/tipografia";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@/components/ui/form-controls";
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  ConfirmButton,
  WarningButton,
  InfoButton,
  GhostButton,
  OutlineButton,
  LinkButton,
} from "@/components/ui/buttons";
import { ColorModeSwitcher } from "@/components/ui/color-mode-switcher";

export default function ComponentsLibraryPage() {
  return (
    <Box p={8} maxW="container.xl" mx="auto">
      <VStack spacing={8} align="start">
        <HStack width="full" justifyContent="space-between" alignItems="center">
          <Heading size="2xl" color="teal.500">
            Biblioteca de Componentes
          </Heading>
          <ColorModeSwitcher />
        </HStack>

        <Paragraph fontSize="lg" color="gray.600">
          Un catálogo de los componentes de UI reutilizables de nuestro proyecto,
          diseñado para garantizar la consistencia visual y de marca.
        </Paragraph>

        <Divider />

        {/* Sección de Botones */}
        <Card width="full" my={4}>
          <CardHeader>
            <Heading size="lg">Botones</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={8} align="start">
              <HStack spacing={4} wrap="wrap">
                <PrimaryButton>Botón Primario</PrimaryButton>
                <SecondaryButton>Secundario</SecondaryButton>
                <DangerButton>Botón de Peligro</DangerButton>
                <ConfirmButton>Botón de Confirmar</ConfirmButton>
                <WarningButton>Botón de Alerta</WarningButton>
                <InfoButton>Botón de Información</InfoButton>
                <GhostButton>Botón Fantasma</GhostButton>
                <OutlineButton>Botón Con Borde</OutlineButton>
                <LinkButton>Botón Enlace</LinkButton>
              </HStack>
              <HStack spacing={4} wrap="wrap">
                <PrimaryButton isLoading>Cargando...</PrimaryButton>
                <PrimaryButton isDisabled>Deshabilitado</PrimaryButton>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Sección de Tipografía */}
        <Card width="full" my={4}>
          <CardHeader>
            <Heading size="lg">Tipografía</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="start">
              <Heading size="xl">Encabezado de Nivel 1</Heading>
              <Heading size="lg">Encabezado de Nivel 2</Heading>
              <Heading size="md">Encabezado de Nivel 3</Heading>
              <Paragraph>
                Este es un párrafo de texto normal. Se utiliza para el contenido principal
                de la página. <Link href="#">Este es un enlace.</Link>
              </Paragraph>
              <Label>Esta es una etiqueta de formulario.</Label>
              <Paragraph fontSize="sm" color="gray.500">
                Este es un texto pequeño para subtítulos o notas al pie.
              </Paragraph>
            </VStack>
          </CardBody>
        </Card>

        {/* Sección de Controles de Formulario */}
        <Card width="full" my={4}>
          <CardHeader>
            <Heading size="lg">Controles de Formulario</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="start" width="full">
              <FormControl id="email-example">
                <FormLabel>Correo Electrónico</FormLabel>
                <Input type="email" placeholder="ejemplo@correo.com" />
              </FormControl>
              <FormControl id="message-example">
                <FormLabel>Mensaje</FormLabel>
                <Textarea placeholder="Escribe tu mensaje aquí..." />
              </FormControl>
              <FormControl id="disabled-input">
                <FormLabel>Campo Deshabilitado</FormLabel>
                <Input isDisabled placeholder="Este campo no se puede editar" />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

      </VStack>
    </Box>
  );
}