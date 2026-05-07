// types/ActivityItem.ts
export interface ActivityItem {
  id: number;
  title: string;
  image: string;
  description: string;
  date_start: string;
  date_end: string;
  place: string;
  area: string[];
  group: string;
  numero_participantes?: string;
  aliados?: string;
  numero_a_beneficiar?: string;
  numero_beneficiados?: string;
}
