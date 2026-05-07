// app/providers.tsx
"use client";

import { ChakraProvider } from '@chakra-ui/react';
import { ContextProvider } from '@/app/context/context-provider';
import theme from "./theme"; 

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <ContextProvider>
        {children}
      </ContextProvider>
    </ChakraProvider>
  );
}