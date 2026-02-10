// /app/adminfacultad/layout.tsx
import React, { ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { AdminFacultyNavbar } from "@/components/layout/adminfacultad-navbar";

interface AdminFacultyLayoutProps {
  children: ReactNode;
}

export default function AdminFacultyLayout({ children }: AdminFacultyLayoutProps) {
  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <AdminFacultyNavbar />

      {/* Contenido Principal */}
      <Box flex="1" p={10}>
        {children}
      </Box>
    </Flex>
  );
}