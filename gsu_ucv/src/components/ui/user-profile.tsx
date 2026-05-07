"use client";

import React from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Avatar,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';

interface UserProfileClientProps {
  name: string;
  bio: string;
  avatarUrl: string;
}

export const UserProfileClient = ({ name, bio, avatarUrl }: UserProfileClientProps) => {
  // Ahora, useColorModeValue está en el lugar correcto
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');

  return (
    <Card
      maxW="lg"
      mx="auto"
      mt={10}
      bg={cardBgColor}
      rounded="xl"
      shadow="lg"
      overflow="hidden"
    >
      <CardBody p={{ base: 6, md: 8 }}>
        <Stack spacing={4} align="center" textAlign="center">
          <Avatar
            size="xl"
            name={name}
            src={avatarUrl}
          />
          <Heading as="h1" size="xl" color={textColor} mb={2}>
            {name}
          </Heading>
          <Text fontSize="md" color={textColor}>
            {bio}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={4}>
            El layout es estático, solo el contenido del perfil es dinámico.
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
};