"use client";

import { Box, VStack, SimpleGrid, Card, CardBody, Stack, Image } from "@chakra-ui/react";
import React from 'react';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import NextLink from 'next/link';
import dynamic from "next/dynamic";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";

const Carousel = dynamic(() => import("@/components/ui/carousel"), {
  ssr: false,
});

interface InfoCardProps {
    title: string;
    image: string;
}

interface GroupProps {
    id: string;
    title: string;
    image: string | null;
}

const InfoCard = ({ title, image }: InfoCardProps) => {
    return (
        <Card overflow="hidden" variant="outline">
            <Image src={image} alt={title} objectFit="cover" w="100%" h="200px" />
            <CardBody>
                <Stack mt="6" spacing="3">
                    <Heading size="md">{title}</Heading>
                </Stack>
            </CardBody>
        </Card>
    );
};

const GroupCard = ({ id, title, image }: GroupProps) => {
    const placeholderImage = "/imagen-no-disponible.jpg";
    
    return (
        <Card overflow="hidden" variant="unstyled" role="group" display="flex" flexDirection="column">
            <NextLink href={`/grupo/${id}`} passHref>
                <Box cursor="pointer">
                    <Box overflow="hidden" display="flex" justifyContent="center" alignItems="center" width="100%" height="268px" >
                        <Image
                            src={image as string}
                            alt={title}
                            objectFit="cover"
                            maxH="100%" 
                            maxW="100%" 
                            borderRadius="full"
                            fallbackSrc={placeholderImage}
                            transition="all 0.1s"
                            _groupHover={{ border: "3px solid", borderColor: "primary" }}
                        />
                    </Box>
                    <CardBody>
                        <Stack mt="5" spacing="3">
                            <Heading size="md">{title}</Heading>
                        </Stack>
                    </CardBody>
                </Box>
            </NextLink>
        </Card>
    );
};

interface ClientContentProps {
    groups: GroupProps[];
    activities: any[];
}

export function ClientContent({ groups, activities }: ClientContentProps) {
    return (
        <Box width="100%" py={0} px={0}>
            <Box maxW="container.xl" mx="auto" textAlign="center" as="section" id="our-groups" mt={6} mb={20} px={6}>
                <VStack spacing={4} py={8} px={6} textAlign="center">
                    <Heading size="xl">Conoce Nuestros Grupos de Extensión</Heading>
                    {/*<Paragraph fontSize="lg">Aprende nuevas habilidades con el respaldo de la universidad.</Paragraph>*/}
                </VStack>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                    {groups.map(group => (
                        <GroupCard
                            key={group.id} 
                            id={group.id}
                            title={group.title}
                            image={group.image}
                        />
                    ))}
                </SimpleGrid>
                <Stack mt="12" spacing="3">
                    <NextLink href="/grupos" passHref>
                        <PrimaryButton size="md">Ver todos los grupos</PrimaryButton>
                    </NextLink>
                </Stack>
            </Box>

            <Box 
                width="60%" 
                height="4px" 
                bg="primary" 
                mx="auto" 
                my={0} 
                borderRadius="full" 
            />
            <Box >

                <VStack spacing={4} py={12} px={6} textAlign="center">
                    
                    <Heading size="xl" color="gray.800">Nuestras Proximas Actividades</Heading>
                    {/*<Paragraph fontSize="lg">Aprende nuevas habilidades con el respaldo de la universidad.</Paragraph>*/}
                </VStack>

                <Carousel activities={activities} />
            
            </Box>
            
            <Box 
                as="section" 
                id="join-us" 
                width="100%" 
                h="600px" 
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                position="relative"
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    backgroundImage="url('/image-1.png')"
                    backgroundSize="cover"
                    backgroundPosition="center"
                    filter="blur(5px) brightness(0.7)"
                    zIndex={0}
                />
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    bg="radial-gradient(circle, rgba(1,143,124,0.2) 0%, var(--chakra-colors-primary) 100%)"
                    zIndex={1}
                />
                <VStack zIndex={2} spacing={4} py={8} px={6} color={"white"}>
                    <Heading size="4xl">¿Sabes cómo registrar un Grupo de Extensión?</Heading>
                    <NextLink href="/registro" passHref>
                        <SecondaryButton fontSize="4xl" px={10} py={10} size="md" mt={10}>¡Únete!</SecondaryButton>
                    </NextLink>
                </VStack>
            </Box> 
        </Box>
    );
}