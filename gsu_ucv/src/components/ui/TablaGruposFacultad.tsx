"use client";

import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Badge,
  HStack,
  Text,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";

interface Award {
  awardName: string;
  awarddate: number;
}

interface GroupItem {
  id: string;
  title: string;
  image: string;
  fundation: string;
  email: string;
  phone: string;
  faculty: string;
  awards: Award[] | "";
}

interface Props {
  grupos: GroupItem[];
  faculty: string;
}

export default function TablaGruposFacultad({ grupos, faculty }: Props) {
  return (
    <Box p={8}>
      <Heading mb={6} textTransform="capitalize">
        Grupos de la Facultad de {faculty}
      </Heading>

      <Box overflowX="auto" bg="white" p={4} borderRadius="lg" shadow="md">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Grupo</Th>
              <Th>Contacto</Th>
              <Th>Fundación</Th>
              <Th textAlign="center">Acciones</Th>
            </Tr>
          </Thead>

          <Tbody>
            {grupos.map((grupo) => {
              const awardsCount = Array.isArray(grupo.awards)
                ? grupo.awards.length
                : 0;

              return (
                <Tr key={grupo.id}>
                  {/* Grupo */}
                  <Td>
                    <HStack spacing={3}>
                      <Image
                        src={grupo.image}
                        alt={grupo.title}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <Text fontWeight="bold">{grupo.title}</Text>
                    </HStack>
                  </Td>

                  {/* Contacto */}
                  <Td>
                    <Text fontSize="sm">{grupo.email}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {grupo.phone}
                    </Text>
                  </Td>

                  {/* Fundación */}
                  <Td>{grupo.fundation}</Td>

                  {/* Acciones */}
                  <Td textAlign="center">
                    <Button
                      as={Link}
                      href={`/admin/usuarios/${grupo.id}`}
                      size="sm"
                      colorScheme="teal"
                      variant="outline"
                    >
                      Ver
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        {grupos.length === 0 && (
          <Text textAlign="center" mt={6} color="gray.500">
            No hay grupos registrados para esta facultad.
          </Text>
        )}
      </Box>
    </Box>
  );
}
