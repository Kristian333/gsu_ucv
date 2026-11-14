// Opciones de los formularios de usuario (registro y edición de perfil).

export const genderOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
];

// Deben coincidir con el enum deu.education_level_enum del backend: otro valor hace fallar la API.
export const educationOptions = [
  { value: "bachiller", label: "Bachiller" },
  { value: "universitaria_incompleta", label: "Universitaria Incompleta" },
  { value: "universitaria_completa", label: "Universitaria Completa" },
  { value: "posgrado", label: "Posgrado" },
];
