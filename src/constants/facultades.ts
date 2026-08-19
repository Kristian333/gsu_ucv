// src/constants/facultades.ts

export const FACULTADES: string[] = [
  "Agronomía",
  "Arquitectura y Urbanismo",
  "Ciencias",
  "Ciencias Económicas y Sociales",
  "Ciencias Jurídicas y Políticas",
  "Ciencias Veterinarias",
  "Farmacia",
  "Humanidades y Educación",
  "Ingeniería",
  "Medicina",
  "Odontología",
];

export const FACULTADES_FILTRO: string[] = [
  ...FACULTADES,
  "DEU"
];

export const ESCUELAS_POR_FACULTAD: Record<string, string[]> = {
  Agronomía: ["Agronomía"],
  "Arquitectura y Urbanismo": ["Arquitectura"],
  Ciencias: [
    "Computación",
    "Biología",
    "Matemática",
    "Física",
    "Química",
    "Geoquímica",
  ],
  "Ciencias Económicas y Sociales": [
    "Administración y Contaduría",
    "Antropología",
    "Estadística y Ciencias Actuariales",
    "Economía",
    "Estudios Internacionales",
    "Sociología",
    "Trabajo Social",
  ],
  Farmacia: ["Farmacia"],
  "Humanidades y Educación": [
    "Artes",
    "Bibliotecología y Archivología",
    "Comunicación Social",
    "Educación",
    "Filosofía",
    "Geografía",
    "Historia",
    "Idiomas Modernos",
    "Letras",
    "Psicología",
  ],
  Ingeniería: [
    "Ciclo Básico de Ingeniería",
    "Ingeniería Civil",
    "Ingeniería Eléctrica",
    "Ingeniería Geológica, Minas y Geofísica",
    "Ingeniería Mecánica",
    "Ingeniería Metalúrgica y Ciencias de los Materiales",
    "Ingeniería Química",
    "Ingeniería de Petróleo",
    "Ingeniería de Procesos Industriales",
  ],
  "Ciencias Jurídicas y Políticas": [
    "Derecho",
    "Estudios Políticos y Administrativos",
  ],
  Medicina: [
    "Bioanálisis",
    "Enfermería",
    "Medicina Dr. Luis Razetti",
    "Medicina Dr. José María Vargas",
    "Nutrición y Dietética",
    "Salud Pública",
  ],
  Odontología: ["Odontología"],
  "Ciencias Veterinarias": ["Medicina Veterinaria"],
};