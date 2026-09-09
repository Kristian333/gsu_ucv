'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  HStack,
  VStack,
  Heading,
  Text,
  Select,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Badge,
  Card,
  CardBody,
  Divider,
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { GeneralData, ModificacionDetectada } from '@/types/general-info'

interface InfoGeneralEditorProps {
  initialData: GeneralData
  onSave: (data: GeneralData) => Promise<boolean>
}

export function InfoGeneralEditor({ initialData, onSave }: InfoGeneralEditorProps) {
  const toast = useToast()
  const [formData, setFormData] = useState<GeneralData>(initialData)
  const [selectedFacultadId, setSelectedFacultadId] = useState<number>(1)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingAction, setPendingAction] = useState<'save' | 'discard' | null>(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  // --- EXTRACCIÓN Y MUTACIÓN DE DATOS DEU ---
  const deuOrgan = formData.UCV.find((o) => o.key === 'DEU')
  const director = deuOrgan?.miembros.find((m) => m.id_m === 1)
  const jefeGsu = deuOrgan?.miembros.find((m) => m.id_m === 2)

  const facultadesOrgan = formData.UCV.find((o) => o.key === 'FACULTADES')
  const facultadSeleccionada = facultadesOrgan?.miembros.find((m) => m.id_m === selectedFacultadId)

  const handleDirectorChange = (field: 'cargo' | 'nombre', value: string) => {
    setFormData((prev) => ({
      ...prev,
      UCV: prev.UCV.map((org) => {
        if (org.key !== 'DEU') return org
        return {
          ...org,
          miembros: org.miembros.map((m) => (m.id_m === 1 ? { ...m, [field]: value } : m)),
        }
      }),
    }))
  }

  const handleJefeChange = (nombre: string) => {
    setFormData((prev) => ({
      ...prev,
      UCV: prev.UCV.map((org) => {
        if (org.key !== 'DEU') return org
        return {
          ...org,
          miembros: org.miembros.map((m) => (m.id_m === 2 ? { ...m, nombre } : m)),
        }
      }),
    }))
  }

  const handleContactoChange = (field: keyof GeneralData['contacto'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      contacto: { ...prev.contacto, [field]: value },
    }))
  }

  const handleFacultadMemberChange = (id_m: number, field: 'cargo' | 'nombre', value: string) => {
    setFormData((prev) => ({
      ...prev,
      UCV: prev.UCV.map((org) => {
        if (org.key !== 'FACULTADES') return org
        return {
          ...org,
          miembros: org.miembros.map((m) => (m.id_m === id_m ? { ...m, [field]: value } : m)),
        }
      }),
    }))
  }

  // --- AUDITORÍA DE CAMBIOS ---
  const cambiosDetallados = useMemo((): ModificacionDetectada[] => {
    const cambios: ModificacionDetectada[] = []

    if (formData.info !== initialData.info) {
      cambios.push({
        campo: 'Formatos (Encabezado)',
        valorAnterior: initialData.info,
        valorNuevo: formData.info,
      })
    }
    if (formData.pie_pagina !== initialData.pie_pagina) {
      cambios.push({
        campo: 'Formatos (Pie de página)',
        valorAnterior: initialData.pie_pagina,
        valorNuevo: formData.pie_pagina,
      })
    }

    if (formData.contacto.email_gsu !== initialData.contacto?.email_gsu) {
      cambios.push({
        campo: 'Contacto DEU (Correo GSU)',
        valorAnterior: initialData.contacto?.email_gsu || '',
        valorNuevo: formData.contacto.email_gsu,
      })
    }
    if (formData.contacto.telefono_gsu !== initialData.contacto?.telefono_gsu) {
      cambios.push({
        campo: 'Contacto DEU (Teléfono GSU)',
        valorAnterior: initialData.contacto?.telefono_gsu || '',
        valorNuevo: formData.contacto.telefono_gsu,
      })
    }
    if (formData.contacto.direccion_deu !== initialData.contacto?.direccion_deu) {
      cambios.push({
        campo: 'Contacto DEU (Dirección)',
        valorAnterior: initialData.contacto?.direccion_deu || '',
        valorNuevo: formData.contacto.direccion_deu,
      })
    }

    // Miembros DEU
    const initDeu = initialData.UCV.find((o) => o.key === 'DEU')
    const currDeu = formData.UCV.find((o) => o.key === 'DEU')

    currDeu?.miembros.forEach((currM) => {
      const initM = initDeu?.miembros.find((m) => m.id_m === currM.id_m)
      if (initM) {
        if (initM.cargo !== currM.cargo) {
          cambios.push({
            campo: `DEU (${currM.nombre} - Cargo/Título)`,
            valorAnterior: initM.cargo,
            valorNuevo: currM.cargo,
          })
        }
        if (initM.nombre !== currM.nombre) {
          cambios.push({
            campo: `DEU (${currM.cargo} - Nombre)`,
            valorAnterior: initM.nombre,
            valorNuevo: currM.nombre,
          })
        }
      }
    })

    // Miembros Facultades
    const initFac = initialData.UCV.find((o) => o.key === 'FACULTADES')
    const currFac = formData.UCV.find((o) => o.key === 'FACULTADES')

    currFac?.miembros.forEach((currM) => {
      const initM = initFac?.miembros.find((m) => m.id_m === currM.id_m)
      if (initM) {
        if (initM.cargo !== currM.cargo) {
          cambios.push({
            campo: `Facultad ${currM.facultad} (Título)`,
            valorAnterior: initM.cargo,
            valorNuevo: currM.cargo,
          })
        }
        if (initM.nombre !== currM.nombre) {
          cambios.push({
            campo: `Facultad ${currM.facultad} (Coordinador/a)`,
            valorAnterior: initM.nombre,
            valorNuevo: currM.nombre,
          })
        }
      }
    })

    return cambios
  }, [formData, initialData])

  const hasChanges = cambiosDetallados.length > 0

  const handleOpenConfirm = (action: 'save' | 'discard') => {
    setPendingAction(action)
    onOpen()
  }

  const handleConfirmAction = async () => {
    if (pendingAction === 'discard') {
      setFormData(initialData)
      toast({
        title: 'Cambios descartados',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
      onClose()
    } else if (pendingAction === 'save') {
      setIsSaving(true)
      const success = await onSave(formData)
      setIsSaving(false)
      if (success) {
        toast({
          title: 'Información actualizada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      } else {
        toast({
          title: 'Error al guardar los cambios',
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    }
  }

  return (
    <Box bg="white" p={{ base: 4, md: 8 }} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
      <Tabs variant="enclosed" colorScheme="teal">
        <TabList mb={6}>
          <Tab fontWeight="bold">Info DEU</Tab>
          <Tab fontWeight="bold">Facultades</Tab>
          <Tab fontWeight="bold">Formatos</Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: INFO DEU */}
          <TabPanel px={0}>
            <VStack spacing={6} align="stretch">
              <Card variant="outline" borderRadius="xl">
                <CardBody>
                  <Heading size="md" mb={4} color="gray.700">
                    Autoridades Directivas
                  </Heading>
                  <VStack spacing={4}>
                    <HStack w="full" spacing={4} align="flex-end">
                      <FormControl maxW="280px">
                        <FormLabel fontSize="sm" fontWeight="semibold">
                          Cargo / Título Director(a)
                        </FormLabel>
                        <Input
                          value={director?.cargo || ''}
                          onChange={(e) => handleDirectorChange('cargo', e.target.value)}
                        />
                      </FormControl>
                      <FormControl flex={1}>
                        <FormLabel fontSize="sm" fontWeight="semibold">
                          Nombre del Director/a
                        </FormLabel>
                        <Input
                          value={director?.nombre || ''}
                          onChange={(e) => handleDirectorChange('nombre', e.target.value)}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold">
                        Jefe de Departamento de Gestión Social Universitaria (GSU)
                      </FormLabel>
                      <Input
                        value={jefeGsu?.nombre || ''}
                        onChange={(e) => handleJefeChange(e.target.value)}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Card variant="outline" borderRadius="xl">
                <CardBody>
                  <Heading size="md" mb={4} color="gray.700">
                    Ubicación y Contacto
                  </Heading>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold">
                        Correo de contacto GSU
                      </FormLabel>
                      <Input
                        value={formData.contacto?.email_gsu || ''}
                        onChange={(e) => handleContactoChange('email_gsu', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold">
                        Número de contacto GSU
                      </FormLabel>
                      <Input
                        value={formData.contacto?.telefono_gsu || ''}
                        onChange={(e) => handleContactoChange('telefono_gsu', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold">
                        Dirección DEU
                      </FormLabel>
                      <Input
                        value={formData.contacto?.direccion_deu || ''}
                        onChange={(e) => handleContactoChange('direccion_deu', e.target.value)}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* TAB 2: FACULTADES */}
          <TabPanel px={0}>
            <Card variant="outline" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4} color="gray.700">
                  Coordinadores de Extensión por Facultad
                </Heading>
                <VStack spacing={6} align="stretch">
                  <FormControl maxW="400px">
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Seleccionar Facultad:
                    </FormLabel>
                    <Select
                      value={selectedFacultadId}
                      onChange={(e) => setSelectedFacultadId(Number(e.target.value))}
                      borderRadius="lg"
                    >
                      {facultadesOrgan?.miembros.map((m) => (
                        <option key={m.id_m} value={m.id_m}>
                          {m.facultad}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  {facultadSeleccionada && (
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={4} align="flex-end">
                        <FormControl maxW="240px">
                          <FormLabel fontSize="sm" fontWeight="semibold">
                            Título / Cargo
                          </FormLabel>
                          <Input
                            value={facultadSeleccionada.cargo}
                            onChange={(e) =>
                              handleFacultadMemberChange(
                                facultadSeleccionada.id_m,
                                'cargo',
                                e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormControl flex={1}>
                          <FormLabel fontSize="sm" fontWeight="semibold">
                            Nombre del Coordinador/a
                          </FormLabel>
                          <Input
                            value={facultadSeleccionada.nombre}
                            onChange={(e) =>
                              handleFacultadMemberChange(
                                facultadSeleccionada.id_m,
                                'nombre',
                                e.target.value
                              )
                            }
                          />
                        </FormControl>
                      </HStack>
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* TAB 3: FORMATOS */}
          <TabPanel px={0}>
            <Card variant="outline" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4} color="gray.700">
                  Textos Predeterminados de Formatos
                </Heading>
                <VStack spacing={6}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Información de Contacto y Dirección en Pie de Página
                    </FormLabel>
                    <Textarea
                      rows={3}
                      value={formData.info}
                      onChange={(e) => setFormData((prev) => ({ ...prev, info: e.target.value }))}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Texto Extra Pie de Página
                    </FormLabel>
                    <Textarea
                      rows={3}
                      value={formData.pie_pagina}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, pie_pagina: e.target.value }))
                      }
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* BOTONES DE ACCIÓN FLOTANTES / BOTTOM */}
      <HStack justify="flex-end" spacing={4} mt={8} pt={4} borderTop="1px" borderColor="gray.100">
        <Button
          variant="ghost"
          colorScheme="red"
          isDisabled={!hasChanges || isSaving}
          onClick={() => handleOpenConfirm('discard')}
        >
          Descartar Cambios
        </Button>
        <Button
          colorScheme="teal"
          isDisabled={!hasChanges}
          isLoading={isSaving}
          onClick={() => handleOpenConfirm('save')}
        >
          Guardar Cambios
        </Button>
      </HStack>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            {pendingAction === 'save' ? 'Confirmar Guardado' : 'Confirmar Descarte'}
          </ModalHeader>
          <ModalBody>
            <Text mb={4}>
              {pendingAction === 'save'
                ? 'Se aplicarán las siguientes modificaciones en la información general:'
                : '¿Estás seguro de descartar todos los cambios realizados? Se revertirá a los valores guardados actualmente.'}
            </Text>

            {hasChanges && (
              <Box maxH="240px" overflowY="auto" bg="gray.50" p={4} borderRadius="xl">
                <List spacing={3}>
                  {cambiosDetallados.map((cambio, index) => (
                    <ListItem key={index} fontSize="sm">
                      <ListIcon
                        as={pendingAction === 'save' ? CheckCircleIcon : WarningIcon}
                        color={pendingAction === 'save' ? 'teal.500' : 'orange.500'}
                      />
                      <Text as="span" fontWeight="bold">
                        {cambio.campo}:
                      </Text>{' '}
                      <Badge colorScheme="red" mx={1}>
                        {cambio.valorAnterior || 'Vació'}
                      </Badge>{' '}
                      &rarr;{' '}
                      <Badge colorScheme="green" mx={1}>
                        {cambio.valorNuevo}
                      </Badge>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSaving}>
              Cancelar
            </Button>
            <Button
              colorScheme={pendingAction === 'save' ? 'teal' : 'red'}
              onClick={handleConfirmAction}
              isLoading={isSaving}
            >
              {pendingAction === 'save' ? 'Sí, Guardar' : 'Sí, Descartar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}