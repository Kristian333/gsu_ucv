// src/components/ui/pagination.tsx
"use client";

import { Button, ButtonGroup, Flex } from "@chakra-ui/react";
import { useRouter } from 'next/navigation';
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath?: string; // Ruta base
    queryParams?: Record<string, string | number>; // Parámetros adicionales opcionales
}

export function Pagination({ currentPage, totalPages, basePath = "", queryParams = {} }: PaginationProps) {
    const router = useRouter();

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Cantidad máxima de botones a mostrar
        const ellipsis = '...';

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            // Lógica para mostrar las primeras, las del medio y las últimas páginas
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage === 1) {
                start = 2;
                end = 3;
            } else if (currentPage === totalPages) {
                start = totalPages - 2;
                end = totalPages - 1;
            }

            pageNumbers.push(1); // Siempre muestra la primera página

            if (start > 2) pageNumbers.push(ellipsis);

            for (let i = start; i <= end; i++) pageNumbers.push(i);

            if (end < totalPages - 1) pageNumbers.push(ellipsis);

            pageNumbers.push(totalPages); // Siempre muestra la última página
        }

        return pageNumbers;
    };

    // Construye la URL incluyendo queryParams adicionales
    const buildUrl = (page: number) => {
        const params: Record<string, string> = {
            ...Object.fromEntries(
            Object.entries(queryParams).map(([key, value]) => [key, String(value)])
            ),
            page: String(page),
        };
        const searchParams = new URLSearchParams(params);
        return `${basePath}?${searchParams.toString()}`;
    };

    const handlePageClick = (page: number) => router.push(buildUrl(page));

    const handlePrevious = () => currentPage > 1 && router.push(buildUrl(currentPage - 1));

    const handleNext = () => currentPage < totalPages && router.push(buildUrl(currentPage + 1));

    const pages = getPageNumbers();

    return (
        <Flex mt={10} justifyContent="center" alignItems="center">
            <ButtonGroup spacing="2">
                <Button onClick={handlePrevious} isDisabled={currentPage === 1}>Anterior</Button>
                {pages.map((page, index) =>
                    typeof page === 'number' ? (
                        <Button
                            key={index}
                            onClick={() => handlePageClick(page)}
                            variant={page === currentPage ? 'solid' : 'outline'}
                            colorScheme={page === currentPage ? 'blue' : 'gray'}
                        >
                            {page}
                        </Button>
                    ) : (
                        <Button key={index} variant="ghost" isDisabled>
                            {page}
                        </Button>
                    )
                )}
                <Button onClick={handleNext} isDisabled={currentPage === totalPages}>Siguiente</Button>
            </ButtonGroup>
        </Flex>
    );
}
