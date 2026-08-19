"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  type: "approve" | "reject";
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmationModal({
  isOpen,
  type,
  loading,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const isApprove = type === "approve";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="lg">
        <ModalHeader color="gray.800">
          {isApprove ? "Aprobar Solicitud" : "Rechazar Solicitud"}
        </ModalHeader>
        <ModalBody>
          <Text color="gray.600" fontSize="sm">
            {isApprove
              ? "¿Estás seguro de que deseas aprobar esta solicitud de grupo?"
              : "¿Estás seguro de que deseas rechazar esta solicitud de grupo?"}
          </Text>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="outline"
            onClick={onClose}
            isDisabled={loading}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            colorScheme={isApprove ? "green" : "red"}
            onClick={onConfirm}
            isLoading={loading}
            loadingText="Procesando..."
            size="sm"
          >
            {isApprove ? "Aprobar" : "Rechazar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}