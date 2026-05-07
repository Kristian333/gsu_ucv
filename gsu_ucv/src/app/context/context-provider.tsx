// app/context/context-providers.tsx
"use client";

import { ReactNode } from 'react';
import { AuthProvider } from './auth-context';
import { GlobalDataProvider } from './global-data-context';

export function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GlobalDataProvider>
        {children}
      </GlobalDataProvider>
    </AuthProvider>
  );
}