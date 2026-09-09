// src/components/admin/dashboard-card.tsx
"use client";

import { Box, Heading, Text, Flex, Spacer, Tag, Link as ChakraLink, Icon, HStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import React from 'react';

export interface CardTag {
  count: number;
  label: string;
  colorScheme: string;
}

interface DashboardCardProps {
  title: string;
  description: string;
  tags?: CardTag[];
  link: string;
  linkText: string;
}

export function DashboardCard({ title, description, tags = [], link, linkText }: DashboardCardProps) {
  return (
    <NextLink href={link} passHref legacyBehavior>
      <ChakraLink _hover={{ textDecoration: 'none' }}>
        <Box p={6} borderWidth="1px" rounded="lg" shadow="md" _hover={{ shadow: "xl" }} transition="box-shadow 0.2s">
          <Flex alignItems="center">
            <Heading size="md">{title}</Heading>
            <Spacer />
            <HStack spacing={2}>
              {tags.map((tag, idx) => (
                <Tag
                  key={idx}
                  size="lg"
                  variant="solid"
                  colorScheme={tag.colorScheme}
                  rounded="full"
                  px={3}
                >
                  {tag.count} {tag.label}
                </Tag>
              ))}
            </HStack>
          </Flex>
          <Text mt={4} fontSize="sm" color="gray.500">{description}</Text>
          <Flex mt={4} alignItems="center">
            <Text fontSize="sm" fontWeight="bold" color="secondary.500">
              {linkText}
            </Text>
            <Icon as={FaArrowRight} ml={2} color="secondary.500" />
          </Flex>
        </Box>
      </ChakraLink>
    </NextLink>
  );
}