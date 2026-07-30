// types/user.ts

export interface UserDetailBackend {
  id: string;
  cedula?: string;
  email: string;
  nombres: string;
  apellidos: string;
  fecha_de_nacimiento?: string;
  genero?: string;
  nivel_educativo?: string;
  direccion?: string;
  creado_en?: string;
}