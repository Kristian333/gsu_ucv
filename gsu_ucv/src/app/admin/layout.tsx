// /app/admin/layout.tsx
import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { AdminNavbar } from '@/components/layout/admin-navbar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Flex direction="column" minH="100vh">
      {/* La mini-navbar se muestra arriba de todo el contenido */}
      <AdminNavbar />

      {/* El contenido de la página actual (dashboard, solicitudes, etc.) */}
      <Box as="main" flex="1" p={6}>
        {children}
      </Box>
    </Flex>
  );
}