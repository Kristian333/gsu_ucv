// app/context/global-data-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";

type CourseDataType = {
  id: string; // 👈 Agrega un ID al tipo
  denominacion: string;
};

interface GlobalDataContextProps {
  providerCode: string | null;
  courses: CourseDataType[];
  isCohortOpen: boolean; // ✅ Agrega el nuevo estado
  setProviderCode: (code: string | null) => void;
  addCourse: (course: CourseDataType) => void;
  setCohortOpen: (isOpen: boolean) => void; // ✅ Agrega la nueva función
}

const GlobalDataContext = createContext<GlobalDataContextProps | undefined>(undefined);

export const GlobalDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { isHydrated, isAuthenticated } = useAuth();
  const [providerCode, setProviderCodeState] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseDataType[]>([]);
  const [isCohortOpen, setIsCohortOpen] = useState(false); // ✅ Declara el estado de la cohorte

  const setProviderCode = (code: string | null) => {
    localStorage.setItem("providerCode", code || "");
    setProviderCodeState(code);
  };
  
  const addCourse = (course: Omit<CourseDataType, 'id'>) => { // 👈 Ahora recibe un objeto sin ID
    // Genera un ID simple para el ejemplo
    const newCourse = { ...course, id: Date.now().toString() }; 
    setCourses(prevCourses => [...prevCourses, newCourse]);
  };

  const setCohortOpen = (isOpen: boolean) => { // ✅ Declara la función
    setIsCohortOpen(isOpen);
  };

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const storedProviderCode = localStorage.getItem("providerCode");
      if (storedProviderCode) {
        setProviderCodeState(storedProviderCode);
      }
    }
  }, [isHydrated, isAuthenticated]);

  const value = {
    providerCode,
    courses,
    isCohortOpen, // ✅ Incluye el nuevo estado en el valor del contexto
    setProviderCode,
    addCourse,
    setCohortOpen, // ✅ Incluye la nueva función
  };

  return <GlobalDataContext.Provider value={value}>{children}</GlobalDataContext.Provider>;
};

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error("useGlobalData must be used within a GlobalDataProvider");
  }
  return context;
};