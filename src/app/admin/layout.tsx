"use client";
import { Box, Flex, Center, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AdminNavbar } from '@/components/layout/admin-navbar';
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isHydrated) {
      const roles = (user?.roles || []).map(r => r.toLowerCase());
      const esAdmin = roles.includes('root') || roles.includes('deu_admin');

      if (!user || !esAdmin) {
        router.push("/login?error=unauthorized");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || !authorized) {
    return (
      <Center h="100vh" flexDirection="column">
        <Spinner size="xl" color="green.500" thickness="4px" />
        <Text mt={4}>Cargando Panel DEU...</Text>
      </Center>
    );
  }

  return (
    <Flex direction="column" minH="100vh">
      <AdminNavbar />
      <Box as="main" flex="1" p={8} bg="gray.50">{children}</Box>
    </Flex>
  );
}