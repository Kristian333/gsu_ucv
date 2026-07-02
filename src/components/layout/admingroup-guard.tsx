"use client";

import React, { useEffect, useState } from "react";
import { Center, Spinner, Text } from '@chakra-ui/react';
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

interface GuardProps {
  children: React.ReactNode;
}

export function AdminGroupGuard({ children }: GuardProps) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    const roles = (user?.roles || []).map(r => r.toLowerCase().trim());
    const esAdminDeGrupo = roles.includes('group_admin');
    const esAyudanteDeGrupo = roles.includes('group_helper');
    const esVisitnate = roles.includes('visitante');

    if (!user || !(esAdminDeGrupo || esAyudanteDeGrupo || esVisitnate)) {
      router.push("/login?error=unauthorized");
    } else {
      setAuthorized(true);
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || !authorized) {
    return (
      <Center h="100vh" flexDirection="column" bg="white">
        <Spinner 
          size="xl" 
          color="green.500" 
          thickness="4px" 
          speed="0.65s" 
          emptyColor="gray.100"
        />
        <Text mt={4} fontWeight="medium" color="gray.600">
          Cargando Panel de Grupo...
        </Text>
      </Center>
    );
  }

  return <>{children}</>;
}