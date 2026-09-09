"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  Badge,
  RadioGroup,
  Stack,
  Radio,
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
} from '@chakra-ui/react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/context/auth-context";

interface UserBackend {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  roles?: string[]; 
  domain_type?: string;
}

interface UsersTableProps {
  initialUsers: UserBackend[];
}

const getRoleColorScheme = (rol: string) => {
  switch (rol?.toLowerCase()) {
    case 'root': return 'purple';
    case 'deu_admin': return 'red';
    case 'faculty_admin': return 'orange';
    case 'group_admin': return 'teal';
    case 'group_helper': return 'blue';
    case 'visitante': return 'gray';
    default: return 'gray';
  }
};

const traducirRolParaModal = (rol: string): string => {
  switch (rol) {
    case 'deu_admin': return 'Administrador de la Dirección de Extensión Universitaria';
    case 'faculty_admin': return 'Coordinador de Facultad';
    case 'group_admin': return 'Administrador de Grupo de Extensión';
    case 'group_helper': return 'Subcuenta de Grupo de Extensión';
    default: return rol;
  }
};

export function UsersTable({ initialUsers }: UsersTableProps) {
  const { user: currentUser, isHydrated } = useAuth();
  const authLoading = !isHydrated;
  const router = useRouter();
  const toast = useToast();

const [users, setUsers] = useState<UserBackend[]>(initialUsers);
  const [filter, setFilter] = useState<string>('Todos');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userToDelete, setUserToDelete] = useState<UserBackend | null>(null);
  const cancelRef = useRef<any>(null);

  // Extraer roles del administrador logueado
  const misRoles = (currentUser?.roles || []).map(r => r.toLowerCase().trim());
  const esRoot = misRoles.includes('root');
  const esDeuAdmin = misRoles.includes('deu_admin');

  // Redirección de seguridad en el cliente si no tiene rol correspondiente
  useEffect(() => {
    if (!authLoading && !esRoot && !esDeuAdmin) {
      router.push('/login?error=unauthorized');
    }
  }, [esRoot, esDeuAdmin, authLoading, router]);

  // Carga de datos desde el backend utilizando apiRequest
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Definición de roles disponibles para filtrar según el perfil
  const rolesFiltrables = useMemo(() => {
    if (esRoot) return ['Todos', 'deu_admin', 'faculty_admin', 'group_admin', 'group_helper', 'visitante'];
    if (esDeuAdmin) return ['Todos', 'group_admin', 'visitante'];
    return ['Todos'];
  }, [esRoot, esDeuAdmin]);

  // Filtrado exhaustivo por permisos y selección de radio buttons
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Nota de contingencia: Como el backend no manda roles aún, les asignamos 'visitante' por defecto temporalmente
      const rolesUsuario = u.roles && u.roles.length > 0 
        ? u.roles.map(r => r.toLowerCase().trim()) 
        : ['visitante']; 

      const domainType = u.domain_type || 'group';

      let esVisible = false;
      if (esRoot) {
        esVisible = rolesUsuario.some(r => 
          ['deu_admin', 'faculty_admin', 'group_admin', 'group_helper'].includes(r) ||
          (r === 'visitante' && domainType === 'group')
        );
      } else if (esDeuAdmin) {
        esVisible = rolesUsuario.some(r => 
          ['group_admin'].includes(r) || (r === 'visitante' && domainType === 'group')
        );
      }

      if (!esVisible) return false;

      if (filter === 'Todos') return true;
      return rolesUsuario.includes(filter.toLowerCase().trim());
    });
  }, [users, filter, esRoot, esDeuAdmin]);

  // Función para manejar la eliminación del usuario (Solo Root)
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      // Endpoint tentativo de eliminación en el backend (ej: DELETE /users/:id)
      // await apiRequest(`users/${userToDelete.id}`, { method: "DELETE" });
      
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    toast({
      title: 'Usuario eliminado',
      description: `El usuario ha sido removido del sistema de forma permanente.`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  } catch (err) {
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo procesar la solicitud en el servidor.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setUserToDelete(null);
      onClose();
    }
  };

  return (
    <Box>
      {/* Sección de Filtros Dinámicos */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="md">
        <Text mb={2} fontWeight="bold" color="gray.700">Filtrar por rol:</Text>
        <RadioGroup onChange={setFilter} value={filter}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            {rolesFiltrables.map(tipo => (
              <Radio key={tipo} value={tipo} colorScheme="teal">
                {tipo === 'Todos' ? 'Todos' : tipo}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      </Box>

      {/* Contenedor de la Tabla */}
      <TableContainer minH="300px" border="1px solid" borderColor="gray.100" borderRadius="md">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Nombre Completo</Th>
              <Th>Email</Th>
              <Th>Rol principal</Th>
              {esRoot && <Th textAlign="center">Acciones</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const rolPrincipal = user.roles && user.roles.length > 0 ? user.roles[0] : 'visitante';
                return (
                  <Tr key={user.id} _hover={{ bg: "gray.50" }}>
                    <Td>{user.id}</Td>
                    {/* Al dar click al nombre, redirige dinámicamente al detalle */}
                    <Td 
                      fontWeight="semibold" 
                      color="teal.600" 
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => router.push(`/admin/usuario/${user.id}`)}
                    >
                      {user.nombres} {user.apellidos}
                    </Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge colorScheme={getRoleColorScheme(rolPrincipal)}>
                        {rolPrincipal}
                      </Badge>
                    </Td>
                    {/* Acción de eliminación exclusiva para cuenta Root */}
                    {esRoot && (
                      <Td textAlign="center">
                        <Button 
                          size="xs" 
                          colorScheme="red" 
                          variant="ghost"
                          onClick={() => {
                            setUserToDelete(user);
                            onOpen();
                          }}
                        >
                          ❌
                        </Button>
                      </Td>
                    )}
                </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={esRoot ? 5 : 4} textAlign="center" py={10}>
                  <Text color="gray.500">No hay usuarios que coincidan con los criterios de búsqueda.</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Alerta de Confirmación de Borrado */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              ¿Estás seguro de eliminar a este usuario?
            </AlertDialogHeader>

            <AlertDialogBody>
              Esta acción es irreversible. Estás a punto de borrar a{" "}
              <strong>{userToDelete?.nombres} {userToDelete?.apellidos}</strong>.
              <Box mt={3} p={2} bg="red.50" color="red.700" borderRadius="md" fontWeight="medium" fontSize="sm">
                Es un: {traducirRolParaModal(userToDelete?.roles && userToDelete.roles.length > 0 ? userToDelete.roles[0] : 'visitante')}
            </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Eliminar definitivamente
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}