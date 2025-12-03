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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  RadioGroup,
  Stack,
  Radio,
  Button,
  useToast,
  Select,
  Flex,
} from '@chakra-ui/react';
import React, { useState, useMemo } from 'react';

interface User {
  id: string;
  nombre: string;
  organismo: string;
  rol: string;
}

interface UsersTableProps {
  educacionContinuaUsers: User[];
  grupoExtensionUsers: User[];
}

const getRoleColorScheme = (rol: string) => {
  switch (rol.toLowerCase()) {
    case 'admin':
      return 'red';
    case 'coordinador':
      return 'teal';
    case 'proveedor':
      return 'purple';
    case 'visitante':
      return 'gray';
    default:
      return 'gray';
  }
};

const allRoles = ['Todos', 'admin', 'coordinador', 'proveedor', 'visitante'];
const editableRoles = ['admin', 'coordinador', 'proveedor', 'visitante'];

export function UsersTable({ educacionContinuaUsers, grupoExtensionUsers }: UsersTableProps) {
  const toast = useToast();
  const [filter, setFilter] = useState('Todos');
  const [currentUsers, setCurrentUsers] = useState(educacionContinuaUsers);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  const handleTabChange = (index: number) => {
    setFilter('Todos');
    setEditingUserId(null);
    if (index === 0) {
      setCurrentUsers(educacionContinuaUsers);
    } else {
      setCurrentUsers(grupoExtensionUsers);
    }
  };

  const handleSaveRole = (userId: string) => {
    setCurrentUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, rol: selectedRole } : user
      )
    );

    setEditingUserId(null);
    setSelectedRole('');

    toast({
      title: 'Rol actualizado.',
      description: `El rol del usuario ha sido cambiado a "${selectedRole}".`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const filteredUsers = useMemo(() => {
    if (filter === 'Todos') {
      return currentUsers;
    }
    return currentUsers.filter(user => user.rol === filter);
  }, [currentUsers, filter]);

  const renderTable = (users: User[]) => (
    <TableContainer minH="500px">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Nombre</Th>
            <Th>Organismo</Th>
            <Th width="250px">Rol</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.nombre}</Td>
                <Td>{user.organismo}</Td>
                <Td width="250px" py={1} alignItems="center">
                  {editingUserId === user.id ? (
                    <Flex align="center" width="100%">
                      <Select 
                        size="sm"
                        defaultValue={user.rol}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        mr={2}
                        flex="1"
                      >
                        {editableRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </Select>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleSaveRole(user.id)}
                      >
                        Guardar
                      </Button>
                    </Flex>
                  ) : (
                    <Box 
                      onClick={() => {
                        setEditingUserId(user.id);
                        setSelectedRole(user.rol);
                      }}
                      cursor="pointer"
                    >
                      <Badge colorScheme={getRoleColorScheme(user.rol)}>{user.rol}</Badge>
                    </Box>
                  )}
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={4} textAlign="center" py={10}>
                <Text>No hay usuarios que coincidan con el filtro.</Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );

  const renderFilters = (types: string[]) => (
    <RadioGroup onChange={setFilter} value={filter}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        {types.map(tipo => (
          <Radio key={tipo} value={tipo}>
            {tipo}
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  );

  return (
    <Tabs variant="enclosed" onChange={handleTabChange}>
      <TabList>
        <Tab>Educación Continua ({educacionContinuaUsers.length})</Tab>
        <Tab>Grupo de Extensión ({grupoExtensionUsers.length})</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Box mb={6}>
            <Text mb={2} fontWeight="bold">Filtrar por rol:</Text>
            {renderFilters(allRoles)}
          </Box>
          {renderTable(filteredUsers)}
        </TabPanel>
        <TabPanel>
          <Box mb={6}>
            <Text mb={2} fontWeight="bold">Filtrar por rol:</Text>
            {renderFilters(allRoles)}
          </Box>
          {renderTable(filteredUsers)}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
