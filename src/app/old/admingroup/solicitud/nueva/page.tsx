// app/cartas/page.tsx
import LetterGeneratorClient from "@/components/formularios/LetterGeneratorClient";
import { mockGroupItems } from "@/data/gruposMock";
import { mockActivityItems } from "@/data/actividadesMock";
import templatesData from "@/data/templates.json";
import generalData from "@/data/general_data.json";

export default function CartasPage() {
  return (
    <LetterGeneratorClient 
      groups={mockGroupItems} 
      templates={templatesData} 
      generalData={generalData}
      actividades={mockActivityItems}
    />
  );
}