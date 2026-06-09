import React, { ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { AdminGroupNavbar } from "@/components/layout/admingroup-navbar";

interface AdminGroupLayoutProps {
  children: ReactNode;
}

export default function AdminGroupLayout({ children }: AdminGroupLayoutProps) {
  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <AdminGroupNavbar />

      {/* Contenido Principal */}
      <Box flex="1" p={10}>
        {children}
      </Box>
    </Flex>
  );
}
