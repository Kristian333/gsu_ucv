// src/components/ui/contact-support-card.tsx
"use client";

import React from "react";
import { Box, Text, Divider, BoxProps } from "@chakra-ui/react";
import generalData from "@/data/general_data.json";

interface ContactSupportCardProps extends BoxProps {
  title?: string;
}

export function ContactSupportCard({
  title = "Para más información:",
  ...boxProps
}: ContactSupportCardProps) {
  const { contacto } = generalData;

  return (
    <Box
      mt={12}
      w="100%"
      maxW="600px"
      p={8}
      bg="gray.100"
      borderRadius="lg"
      boxShadow="md"
      textAlign="center"
      mx="auto"
      {...boxProps}
    >
      <Text fontSize="lg" fontWeight="semibold">
        {title}
      </Text>
      <Text fontSize="md" mt={2}>
        📧 {contacto.email_gsu}
      </Text>
      <Text fontSize="md">📱 {contacto.telefono_gsu}</Text>

      <Divider my={4} borderColor="gray.300" />

      <Text fontSize="lg" fontWeight="semibold">
        Dirección de Extensión:
      </Text>
      <Text fontSize="md" mt={2}>
        {contacto.direccion_deu}
      </Text>
    </Box>
  );
}