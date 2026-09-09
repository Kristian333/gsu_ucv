export interface MemberDEU {
  id_m: number
  cargo: string
  nombre: string
  facultad?: string
}

export interface OrganoUCV {
  id_ucv: number
  key: 'DEU' | 'FACULTADES'
  organo: string
  miembros: MemberDEU[]
}

export interface ContactoInfo {
  email_gsu: string
  telefono_gsu: string
  direccion_deu: string
}

export interface GeneralData {
  info: string
  pie_pagina: string
  contacto: ContactoInfo
  UCV: OrganoUCV[]
}

export interface ModificacionDetectada {
  campo: string
  valorAnterior: string
  valorNuevo: string
}