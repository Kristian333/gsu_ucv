// components/modals/SessionExpiredModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Icon,
  VStack,
} from "@chakra-ui/react";
import { authEvents } from "@/utils/authEvents";
import { useAuth } from "@/app/context/auth-context";

export default function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = authEvents.onSessionExpired(() => {
      setIsOpen(true);
    });

    if (searchParams.get("expired") === "true") {
      setIsOpen(true);
    }

    return () => {
      unsubscribe();
    };
  }, [searchParams]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
      size="md"
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader textAlign="center" pt={6}>
          <VStack spacing={2}>
            <Text fontSize="xl" fontWeight="bold" color="red.500">
              Sesión Expirada
            </Text>
          </VStack>
        </ModalHeader>

        <ModalBody textAlign="center">
          <Text color="gray.600">
            Tu sesión ha expirado por motivos de seguridad. Por favor, inicia sesión de nuevo para continuar.
          </Text>
        </ModalBody>

        <ModalFooter justifyContent="center" pb={6}>
          <Button
            colorScheme="red"
            size="lg"
            width="full"
            onClick={handleLogout}
          >
            Entendido, Cerrar Sesión
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}