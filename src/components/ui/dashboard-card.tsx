// src/components/admin/dashboard-card.tsx
"use client";

import { Box, Heading, Text, Flex, Spacer, Tag, Link as ChakraLink, Icon } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import React from 'react';

interface DashboardCardProps {
  title: string;
  description: string;
  count: number | null;
  countLabel?: string;
  link: string;
  linkText: string;
}

export function DashboardCard({ title, description, count, countLabel, link, linkText }: DashboardCardProps) {
  return (
    <NextLink href={link} passHref legacyBehavior>
      <ChakraLink _hover={{ textDecoration: 'none' }}>
        <Box p={6} borderWidth="1px" rounded="lg" shadow="md" _hover={{ shadow: "xl" }} transition="box-shadow 0.2s">
          <Flex alignItems="center">
            <Heading size="md">{title}</Heading>
            <Spacer />
            {count !== null && (
              <Tag
                size="lg"
                variant="solid"
                colorScheme="red"
                rounded="full"
                px={3}
              >
                {count} {countLabel}
              </Tag>
            )}
          </Flex>
          <Text mt={4} fontSize="sm" color="gray.500">{description}</Text>
          <Flex mt={4} alignItems="center">
            <Text fontSize="sm" fontWeight="bold" color="blue.500">
              {linkText}
            </Text>
            <Icon as={FaArrowRight} ml={2} color="blue.500" />
          </Flex>
        </Box>
      </ChakraLink>
    </NextLink>
  );
}