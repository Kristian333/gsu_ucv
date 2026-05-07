"use client";
import { Box, Flex, Center, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AdminFacultyNavbar } from '@/components/layout/adminfacultad-navbar';
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isHydrated) {
      const roles = (user?.roles || []).map(r => r.toLowerCase());
      if (!user || !roles.includes('faculty_admin')) {
        router.push("/login?error=unauthorized");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || !authorized) {
    return (
      <Center h="100vh" flexDirection="column">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4}>Cargando Panel de Facultad...</Text>
      </Center>
    );
  }

  return (
    <Flex minH="100vh">
      <AdminFacultyNavbar />
      <Box flex="1" p={10} bg="white">{children}</Box>
    </Flex>
  );
}