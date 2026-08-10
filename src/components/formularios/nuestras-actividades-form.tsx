// components/formularios/nuestras-actividades-form
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Box, 
  Heading, 
  Center, 
  Spinner, 
  Text,
  Select,
  Flex,
  Stack,
  useToast
} from "@chakra-ui/react";
import { apiRequest } from "@/components/formularios/api";
import { useAuth } from "@/app/context/auth-context";
import TablaNuestrasActividades from "@/components/ui/tabla-nuestras-actividades";
import { Pagination } from "@/components/ui/pagination";
import { getActivityStatus } from "@/utils/common";

export interface Actividad {
  id: number | string;
  nombre?: string;
  ubicacion?: string; 
  fecha_inicio?: string; 
  fecha_fin?: string;    
  descripcion?: string;
  participantes_reales?: number | string | null;
  destacado?: boolean;
  is_featured?: boolean;
}

interface FormProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function VistaNuestrasActividadesForm({ searchParams = {} }: FormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { user, isHydrated } = useAuth();

  // Leer params desde la URL
  const currentPage = Number(searchParams.page) || 1;
  const estadoFilter = (searchParams.estado as string) || "";
  const yearFilter = (searchParams.year as string) || "";
  const featuredFilter = (searchParams.is_featured as string) || "";

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginación y Contadores
  const [totalPages, setTotalPages] = useState<number>(1);
  const [counts, setCounts] = useState({
    proximamente: 0,
    enCurso: 0,
    esperanReporte: 0,
    total: 0,
  });

  // Función helper para actualizar los searchParams en la URL
  const updateQueryParams = (newParams: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams();

    if (estadoFilter) current.set("estado", estadoFilter);
    if (yearFilter) current.set("year", yearFilter);
    if (featuredFilter) current.set("is_featured", featuredFilter);
    current.set("page", String(currentPage));

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    router.push(`${pathname}?${current.toString()}`);
  };

  const cargarActividades = async () => {
    if (!user?.groupId) return;
    setLoading(true);

    try {
      const storedGroupId = user?.groupId;
      const token = localStorage.getItem("token") || "";

      // Petición para la página actual
      let url = `activities?group_id=${storedGroupId}&page=${currentPage}&per_page=10`;
      if (featuredFilter) url += `&is_featured=${featuredFilter}`;

      const response = await apiRequest(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Petición completa (sin paginar) para calcular contadores de estado exactos
      const allResponse = await apiRequest(`activities?group_id=${storedGroupId}&disablePaging=true`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response && !response.error) {
        const rawList: Actividad[] = response.actividades || (Array.isArray(response) ? response : []);

        const procesadas = rawList.map((act) => ({
          ...act,
          nombre: act.nombre,
          location: act.ubicacion || "Sin ubicación registrada",
          destacado: !!act.destacado,
        }));

        setActividades(procesadas);
        if (response.page_scope) {
          setTotalPages(response.page_scope.total_pages || 1);
        }
      } else {
        throw new Error(response?.message || "No se pudo sincronizar la información.");
      }

      // Procesar Contadores
      if (allResponse && !allResponse.error) {
        const totalList: Actividad[] = allResponse.actividades || (Array.isArray(allResponse) ? allResponse : []);
        
        let proximamente = 0;
        let enCurso = 0;
        let esperanReporte = 0;

        totalList.forEach((a) => {
          const numPart = a.participantes_reales !== null && a.participantes_reales !== undefined && a.participantes_reales !== ""
            ? Number(a.participantes_reales)
            : null;

          const status = getActivityStatus({
            fecha_inicio: a.fecha_inicio,
            fecha_fin: a.fecha_fin,
            participantes_reales: numPart,
          });

          if (status.label === "Actividad Futura") proximamente++;
          if (status.label === "Actividad En Curso") enCurso++;
          if (status.label === "A la Espera de Reporte") esperanReporte++;
        });

        setCounts({
          proximamente,
          enCurso,
          esperanReporte,
          total: totalList.length,
        });
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      cargarActividades();
    }
  }, [isHydrated, user?.groupId, currentPage, featuredFilter]);

  // Filtrado local en cliente (Estado y Año)
  const actividadesFiltradas = actividades.filter((act) => {
const numPart = act.participantes_reales !== null && act.participantes_reales !== undefined && act.participantes_reales !== ""
      ? Number(act.participantes_reales)
      : null;

    const status = getActivityStatus({
      fecha_inicio: act.fecha_inicio,
      fecha_fin: act.fecha_fin,
      participantes_reales: numPart,
    });

    // 1. Filtro por Estado
    if (estadoFilter === "proximamente" && status.label !== "Actividad Futura") return false;
    if (estadoFilter === "en_curso" && status.label !== "Actividad En Curso") return false;
    if (estadoFilter === "espera_reporte" && status.label !== "A la Espera de Reporte") return false;

    // 2. Filtro por Año
    if (yearFilter && act.fecha_inicio) {
      const anio = new Date(act.fecha_inicio).getFullYear().toString();
      if (anio !== yearFilter) return false;
    }

    return true;
  });

  const anioActual = new Date().getFullYear();
  const opcionesAnios = Array.from({ length: 5 }, (_, i) => anioActual - i);

  if (!isHydrated) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="teal.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading mb={6}>Nuestras Actividades</Heading>

      {/* Panel de Filtros */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.100">
        <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center">
          <Flex wrap="wrap" gap={4} flex={1} w="full">
            {/* Estado */}
            <Box minW="220px">
              <Text mb={1} fontSize="sm" fontWeight="bold">
                Estado de la Actividad:
              </Text>
              <Select
                bg="white"
                size="sm"
                borderRadius="md"
                value={estadoFilter}
                onChange={(e) => updateQueryParams({ estado: e.target.value, page: 1 })}
              >
                <option value="">Todas ({counts.total})</option>
                <option value="proximamente">Próximamente ({counts.proximamente})</option>
                <option value="en_curso">En Curso 🔥 ({counts.enCurso})</option>
                <option value="espera_reporte">Esperan Reporte ({counts.esperanReporte})</option>
              </Select>
            </Box>

            {/* Año */}
            <Box minW="140px">
              <Text mb={1} fontSize="sm" fontWeight="bold">
                Año:
              </Text>
              <Select
                bg="white"
                size="sm"
                borderRadius="md"
                value={yearFilter}
                onChange={(e) => updateQueryParams({ year: e.target.value, page: 1 })}
              >
                <option value="">Todos</option>
                {opcionesAnios.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Destacado */}
            <Box minW="140px">
              <Text mb={1} fontSize="sm" fontWeight="bold">
                Destacadas:
              </Text>
              <Select
                bg="white"
                size="sm"
                borderRadius="md"
                value={featuredFilter}
                onChange={(e) => updateQueryParams({ is_featured: e.target.value, page: 1 })}
              >
                <option value="">Todas</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </Select>
            </Box>
          </Flex>
        </Stack>
      </Box>

      {/* Tabla */}
      {loading ? (
        <Center h="300px">
          <Spinner size="lg" color="teal.500" />
        </Center>
            ) : (
        <Box>
          <TablaNuestrasActividades 
            actividades={actividadesFiltradas}
            onRefresh={cargarActividades} 
          />

          <Box mt={6} display="flex" justifyContent="center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={pathname}
              queryParams={{
                ...(estadoFilter ? { estado: estadoFilter } : {}),
                ...(yearFilter ? { year: yearFilter } : {}),
                ...(featuredFilter ? { is_featured: featuredFilter } : {}),
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
