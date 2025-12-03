"use client";

import { Box, Heading, Text, VStack, Link, Button, HStack } from '@chakra-ui/react';

interface CodigoProveedorViewProps {
  documents: {
    name: string;
    url: string;
  }[];
}

export function CodigoProveedorView({ documents }: CodigoProveedorViewProps) {
  // URL de un PDF público de ejemplo para la demostración
  const demoPdfUrl = "/sample-local.pdf";

  return (
    <Box mb={10}>
      <Heading as="h2" size="lg" mb={4}>Documentos Adjuntos</Heading>
      <VStack spacing={6} align="stretch">
        {documents.map((doc, index) => {
          const isImage = doc.name.toLowerCase().endsWith('.png') || 
                          doc.name.toLowerCase().endsWith('.jpg') || 
                          doc.name.toLowerCase().endsWith('.jpeg');
          
          return (
            <Box 
              key={index} 
              p={6} 
              shadow="md" 
              borderWidth="1px" 
              borderColor="gray.200" 
              rounded="lg"
            >
              <VStack spacing={4} align="stretch">
                <HStack justifyContent="space-between" alignItems="center" mb={2}>
                  <Text fontWeight="bold" fontSize="lg">{doc.name}</Text>
                  <Link href={doc.url} isExternal download={doc.name}>
                    <Button colorScheme="gray" variant="outline">
                      Descargar
                    </Button>
                  </Link>
                </HStack>
                
                {isImage ? (
                  <Box
                    position="relative" 
                    width="100%" 
                    paddingTop="75%" 
                    border="1px solid #e2e8f0"
                    rounded="md"
                    overflow="hidden"
                  >
                    <img
                      src={doc.url}
                      alt={`Vista previa del documento: ${doc.name}`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "16px"
                      }}
                    />
                  </Box>
                ) : (
                  <Box 
                    position="relative" 
                    width="100%" 
                    paddingTop="141.42%"
                    border="1px solid #e2e8f0"
                    rounded="md"
                  >
                    <iframe
                      src={demoPdfUrl}
                      title={`Vista previa del documento: ${doc.name}`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none"
                      }}
                    ></iframe>
                  </Box>
                )}
              </VStack>
            </Box>
          );
        })}
      </VStack>
      <Text mt={4} fontSize="sm" color="gray.500" fontStyle="italic">
        * Nota: La vista previa usa un PDF de ejemplo para fines de demostración.
      </Text>
    </Box>
  );
}