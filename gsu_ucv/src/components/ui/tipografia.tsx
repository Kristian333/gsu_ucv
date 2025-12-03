"use client";

import {
  Heading as ChakraHeading,
  Text as ChakraText,
  Link as ChakraLink,
  HeadingProps,
  TextProps,
  LinkProps,
} from "@chakra-ui/react";

/**
 * Componente para títulos y encabezados de página.
 * Usa las props estándar de Chakra UI para tamaño, peso, etc.
 */
export const Heading: React.FC<HeadingProps> = (props) => {
  return <ChakraHeading fontFamily="Montserrat, sans-serif" {...props} />;
};

/**
 * Componente para texto de cuerpo, párrafos y texto en general.
 */
export const Paragraph: React.FC<TextProps> = (props) => {
  return <ChakraText {...props} />;
};

/**
 * Componente para etiquetas de formularios.
 */
export const Label: React.FC<TextProps> = (props) => {
  return <ChakraText as="label" fontWeight="bold" {...props} />;
};

/**
 * Componente para texto pequeño, como avisos o notas al pie.
 */
export const Caption: React.FC<TextProps> = (props) => {
  return <ChakraText fontSize="sm" color="gray.500" {...props} />;
};

/**
 * Componente para enlaces.
 */
export const Link: React.FC<LinkProps> = (props) => {
  return <ChakraLink color="teal.500" {...props} />;
};