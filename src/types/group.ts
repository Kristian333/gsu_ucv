// types/group.ts

export interface GroupMember {
  id: string;
  nombre: string;
  cedula: number;
  telefono: string;
  correo: string;
  coordinacion: string;
  año: string | number; // Soporta la transición temporal de int a string
  facultad: string;
  escuela: string;
  documento: string;
  status: boolean;
}

export interface OwnerInfo {
  id: string;
  cedula?: string;
  email?: string;
  nombres?: string;
  apellidos?: string;
}

export interface Award {
  awardName: string;
  awarddate: number;
}

export interface GroupDetailBackend {
  id: string;
  nombre: string;
  descripcion: string;
  facultad: string;
  fundacion: string;
  tipo: string;
  imagen_url: string;
  proyecto_url: string;
  email: string;
  telefono: string;
  propietario: OwnerInfo;
  objetivo: string;
  ubicacion: string;
  activo: boolean;
  miembros: GroupMember[];
  reconocimientos?: Award[];
  creado_en: string;
  actualizado_en: string;
}