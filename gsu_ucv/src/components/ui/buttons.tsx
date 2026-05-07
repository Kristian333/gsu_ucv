"use client";

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";

interface ButtonLibraryProps extends ButtonProps {}

/**
 * Botón para la acción principal o más importante en una página.
 * Suele ser el más destacado visualmente.
 */
export const PrimaryButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton bg="primary" color="white" size="lg" {...props} />;
};

/**
 * Botón secundario para acciones de menor prioridad.
 * Es menos prominente que el botón primario.
 */
export const SecondaryButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton bg="secondary" color="white" size="lg"  {...props} />;
};

/**
 * Botón para acciones destructivas o irreversibles, como "Eliminar" o "Cerrar".
 * Se usa para advertir al usuario del peligro de la acción.
 */
export const DangerButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton colorScheme="red" {...props} />;
};

/**
 * Botón para confirmar una acción o indicar un resultado positivo.
 */
export const ConfirmButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton colorScheme="green" {...props} />;
};

/**
 * Botón para acciones que requieren precaución o para llamar la atención sobre algo.
 */
export const WarningButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton colorScheme="yellow" {...props} />;
};

/**
 * Botón para acciones informativas o para abrir contenido relacionado.
 */
export const InfoButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton colorScheme="blue" {...props} />;
};

/**
 * Botón con estilo de texto sin fondo ni borde. Ideal para acciones sutiles en modales o tarjetas.
 */
export const GhostButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton variant="ghost" {...props} />;
};

/**
 * Botón con un borde delgado. A menudo se usa como alternativa a un botón secundario.
 */
export const OutlineButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton variant="outline" {...props} />;
};

/**
 * Botón con un estilo de enlace. Mantiene la apariencia de un botón pero actúa como un link.
 */
export const LinkButton: React.FC<ButtonLibraryProps> = (props) => {
  return <ChakraButton variant="link" {...props} />;
};