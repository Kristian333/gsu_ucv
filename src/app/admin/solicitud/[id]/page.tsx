import { Box, Heading, Text, Tag, SimpleGrid, Stat, StatLabel, StatNumber, Divider } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { CodigoProveedorView } from '@/components/ui/codigo-proveedor-view';
import { AdminActions } from '@/components/ui/admin-actions';
import { CourseDetailsView } from '@/components/ui/course-details-view';
import { CourseClassificationForm } from '@/components/formularios/categorias-cursos-form'; // <-- NUEVA IMPORTACIÓN

// Interfaz que incluye todos los campos del formulario de curso.
interface SolicitudDetalle {
  id: string;
  tipo: string;
  estado: string;
  nombre: string;
  fecha: string;
  organismo: string;
  contacto: string;
  descripcion: string;
  documents?: { name: string; url: string }[];
  // Campos del formulario (simplificado para el ejemplo)
  denominacion?: string;
  proposito?: string;
  fundamentacion?: string;
  duracion?: string;
  estructuraCostos?: string;
  perfilDocente?: string;
  perfiles?: string;
  exigencias?: string;
  estructuraCurricular?: string;
  evaluacion?: string;
  cronograma?: string;
  // Campos de compatibilidad
  descripcionCurso?: string;
  propuesta?: string;
  cambiosSolicitados?: string;
}

// Simulación: Lógica para obtener detalles por ID (sustituir con fetch real a la BD)
async function getSolicitudDetails(id: string): Promise<SolicitudDetalle | null> {
  // ... [Mock Data array completo] ...
  const mockData: SolicitudDetalle[] = [
    { 
      id: 'sol-001', 
      tipo: 'Código de Proveedor', 
      estado: 'Pendiente', 
      nombre: 'Organización A', 
      fecha: '2023-10-26', 
      organismo: 'Facultad de Ingeniería',
      contacto: 'carlos.rodriguez@email.com',
      descripcion: 'Solicitud inicial para la obtención del código de proveedor y registro en el sistema de Educación Continua.',
      documents: [
          { name: 'Cédula de Identidad.pdf', url: '/sample-local.pdf' },
          { name: 'RIF.pdf', url: '/sample-local.pdf' },
          { name: 'imagen-1.png', url: '/image-1.png' },
      ]
    },
    { 
      id: 'sol-002', 
      tipo: 'Formulación de Curso - Directa', 
      estado: 'Aprobada', 
      nombre: 'Organización B', 
      fecha: '2023-10-25',
      organismo: 'DEU',
      contacto: 'ana.perez@email.com',
      descripcion: 'Detalles de la formulación del curso "Introducción a la IA" con aprobación directa.',
      denominacion: 'Introducción a la Inteligencia Artificial y Machine Learning',
      proposito: 'Capacitar a profesionales en los fundamentos de la IA y el Machine Learning, con un enfoque práctico para su aplicación en el desarrollo web y de software.',
      fundamentacion: 'Ante la creciente demanda de habilidades en IA, este curso busca cubrir una brecha en la formación técnica local, ofreciendo un programa intensivo y actualizado con las últimas tendencias del sector.',
      duracion: '40 horas',
      estructuraCostos: 'Costo total por participante: $500. Se incluyen materiales de estudio en línea y acceso a laboratorios virtuales. No hay costos adicionales de software.',
      perfilDocente: 'Ingeniero en sistemas o similar con al menos 5 años de experiencia en desarrollo de proyectos de Machine Learning y certificación en plataformas como TensorFlow o PyTorch.',
      perfiles: 'Ingreso: Programadores o analistas de datos con conocimientos básicos de Python. Egreso: Participantes con la capacidad de desarrollar e implementar modelos de IA sencillos.',
      exigencias: 'Se requiere una computadora personal con acceso a internet de alta velocidad y un entorno de desarrollo integrado (IDE) como Visual Studio Code.',
      estructuraCurricular: 'Módulo 1: Fundamentos de IA y ML. Módulo 2: Redes neuronales. Módulo 3: Procesamiento de Lenguaje Natural (PLN). Módulo 4: Proyectos finales.',
      evaluacion: 'Evaluación continua a través de ejercicios prácticos (50%) y un proyecto final (50%). Se requiere una nota mínima de 70% para la aprobación.',
      cronograma: 'El curso se llevará a cabo los sábados de 9:00 a p.m. a 1:00 p.m. durante 10 semanas, con inicio previsto para noviembre de 2023.'
    },
    { 
      id: 'sol-003', 
      tipo: 'Formulación de Curso - Indirecta', 
      estado: 'Pendiente', 
      nombre: 'Organización C', 
      fecha: '2023-10-27',
      organismo: 'Facultad de Ciencias',
      contacto: 'maria.gomez@email.com',
      descripcion: 'Propuesta de curso de "Bioquímica Avanzada" para evaluación y formulación por el departamento correspondiente.',
      denominacion: 'Bioquímica Avanzada: Fundamentos y Aplicaciones',
      proposito: 'Profundizar en la estructura, función y metabolismo de las biomoléculas, con énfasis en técnicas avanzadas de laboratorio.',
      fundamentacion: 'Este curso responde a la necesidad de especialización en áreas de la bioquímica que no se cubren en profundidad en los programas de grado, preparando a los estudiantes para la investigación y la industria farmacéutica.',
      duracion: '60 horas',
      estructuraCostos: 'A ser definido por el departamento de la facultad.',
      perfilDocente: 'PhD en Bioquímica o Biología Molecular con experiencia en docencia universitaria y publicaciones en revistas indexadas.',
      perfiles: 'Ingreso: Estudiantes o profesionales con título de pregrado en Biología, Química o afines. Egreso: Participantes con una comprensión profunda de la bioquímica avanzada y manejo de técnicas de laboratorio.',
      exigencias: 'Acceso a laboratorios de la facultad con equipos de cromatografía, electroforesis y espectrofotometría.',
      estructuraCurricular: 'Sección 1: Metabolismo de carbohidratos y lípidos. Sección 2: Enzimología. Sección 3: Bioquímica de ácidos nucleicos. Sección 4: Técnicas de laboratorio avanzadas.',
      evaluacion: 'Evaluación a través de exámenes teóricos (60%) y una evaluación práctica en el laboratorio (40%).',
      cronograma: 'A ser definido por el departamento. Se estima una duración de 15 semanas con dos sesiones semanales.'
    },
    { 
      id: 'sol-004', 
      tipo: 'Actualización de Curso', 
      estado: 'Pendiente', 
      nombre: 'Organización D', 
      fecha: '2023-10-28',
      organismo: 'CEI',
      contacto: 'david.lopez@email.com',
      descripcion: 'Solicitud de actualización del temario del curso "Gestión de Proyectos"',
      denominacion: 'Gestión de Proyectos',
      proposito: 'Actualizar el contenido del curso para incluir las últimas tendencias y metodologías ágiles en la gestión de proyectos.',
      fundamentacion: 'La industria ha evolucionado hacia metodologías ágiles como Scrum y Kanban, por lo que es crucial actualizar el curso para mantener su relevancia y utilidad para los profesionales.',
      duracion: '32 horas',
      estructuraCostos: 'Sin cambios en la estructura de costos. Se utilizarán las mismas plataformas y recursos.',
      perfilDocente: 'El mismo docente. El Dr. López ya tiene experiencia en metodologías ágiles y puede adaptar el contenido.',
      perfiles: 'Los perfiles de ingreso y egreso se mantienen sin cambios.',
      exigencias: 'No hay nuevas exigencias de materiales. El software de gestión de proyectos se actualizará a la versión 3.5.',
      estructuraCurricular: 'Se solicita añadir un nuevo módulo sobre metodologías ágiles (Scrum y Kanban) y actualizar las herramientas de software utilizadas a la versión más reciente.',
      evaluacion: 'Se incluirá un nuevo proyecto de caso de estudio ágil para la evaluación final.',
      cronograma: 'El cronograma se ajustará para acomodar el nuevo módulo. Se mantiene el total de horas, redistribuyendo el contenido de los módulos existentes.'
    },
  ];

  return mockData.find(s => s.id === id) || null;
}

// Lógica de seguridad (mantenida)
async function checkAdminRole() {
  const user = { role: 'admin' };
  if (user.role !== 'admin') {
    redirect('/login?error=unauthorized');
  }
}

export default async function SolicitudDetallePage({ params }: { params: { id: string } }) {
  await checkAdminRole();

  const solicitud = await getSolicitudDetails(params.id);

  if (!solicitud) {
    notFound();
  }

  // Mapeo de colores para el estado
  const getEstadoColorScheme = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'orange';
      case 'aprobada': return 'green';
      case 'rechazada': return 'red';
      default: return 'gray';
    }
  };

  const isCourseRequest = 
    solicitud.tipo.startsWith('Formulación de Curso') || 
    solicitud.tipo === 'Actualización de Curso';

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={2}>Detalle de Solicitud</Heading>
      <Text fontSize="xl" color="gray.500" mb={6}>{solicitud.id} - {solicitud.nombre}</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={8}>
        <Stat p={5} shadow="md" border="1px" borderColor="gray.200" rounded="lg">
          <StatLabel>Tipo de Solicitud</StatLabel>
          <StatNumber>
            <Tag size="lg" colorScheme="purple">{solicitud.tipo}</Tag>
          </StatNumber>
        </Stat>
        <Stat p={5} shadow="md" border="1px" borderColor="gray.200" rounded="lg">
          <StatLabel>Estado Actual</StatLabel>
          <StatNumber>
            <Tag size="lg" colorScheme={getEstadoColorScheme(solicitud.estado)}>
                {solicitud.estado}
            </Tag>
          </StatNumber>
        </Stat>
        <Stat p={5} shadow="md" border="1px" borderColor="gray.200" rounded="lg">
          <StatLabel>Fecha de Creación</StatLabel>
          <StatNumber fontSize="2xl">{solicitud.fecha}</StatNumber>
        </Stat>
      </SimpleGrid>

      <Divider my={8} />

      {/* Renderizado condicional basado en el tipo de solicitud */}
      {solicitud.tipo === 'Código de Proveedor' && solicitud.documents && (
        <CodigoProveedorView documents={solicitud.documents} />
      )}
      
      {isCourseRequest && (
        <CourseDetailsView solicitud={solicitud} />
      )}
      
      <Divider mb={8} />

      {/* Las acciones del administrador se mantienen siempre */}
      <AdminActions solicitudId={solicitud.id} solicitudTipo={solicitud.tipo} adminOrganismo='ing' />
    </Box>
  );
}
