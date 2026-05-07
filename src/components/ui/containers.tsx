"use client";

import {
  Box as ChakraBox,
  Card as ChakraCard,
  CardBody as ChakraCardBody,
  CardHeader as ChakraCardHeader,
  Stack as ChakraStack,
  StackProps,
  BoxProps,
  CardProps,
} from "@chakra-ui/react";

/**
 * Contenedor genérico para envolver otros elementos.
 */
export const Box: React.FC<BoxProps> = (props) => {
  return <ChakraBox {...props} />;
};

/**
 * Un contenedor con sombra y bordes redondeados, ideal para agrupar contenido.
 */
export const Card: React.FC<CardProps> = (props) => {
  return <ChakraCard {...props} />;
};

/**
 * Cuerpo de una Card.
 */
export const CardBody: React.FC<BoxProps> = (props) => {
  return <ChakraCardBody {...props} />;
};

/**
 * Cabecera de una Card.
 */
export const CardHeader: React.FC<BoxProps> = (props) => {
  return <ChakraCardHeader {...props} />;
};

/**
 * Apila elementos vertical u horizontalmente.
 * Se puede usar como VStack o HStack, ya que acepta 'direction'.
 */
export const Stack: React.FC<StackProps> = (props) => {
  return <ChakraStack {...props} />;
};