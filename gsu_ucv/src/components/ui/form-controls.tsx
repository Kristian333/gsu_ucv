"use client";

import {
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  FormErrorMessage as ChakraFormErrorMessage,
  Input as ChakraInput,
  Textarea as ChakraTextarea,
  FormControlProps,
  FormLabelProps,
  FormErrorMessageProps,
  InputProps,
  TextareaProps,
} from "@chakra-ui/react";

/**
 * Un contenedor para controles de formulario, con soporte para etiquetas y mensajes de error.
 */
export const FormControl: React.FC<FormControlProps> = (props) => {
  return <ChakraFormControl {...props} />;
};

/**
 * Etiqueta para un control de formulario.
 */
export const FormLabel: React.FC<FormLabelProps> = (props) => {
  return <ChakraFormLabel {...props} />;
};

/**
 * Mensaje de error para un campo de formulario.
 */
export const FormErrorMessage: React.FC<FormErrorMessageProps> = (props) => {
  return <ChakraFormErrorMessage {...props} />;
};

/**
 * Campo de entrada de texto.
 */
export const Input: React.FC<InputProps> = (props) => {
  return <ChakraInput {...props} />;
};

/**
 * Área de texto para entradas de varias líneas.
 */
export const Textarea: React.FC<TextareaProps> = (props) => {
  return <ChakraTextarea {...props} />;
};