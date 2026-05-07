// app/actividad/[activityId]/page.tsx

import ActivityClientPage from "@/components/ui/actividad";
import { mockActivityItems } from "@/data/actividadesMock";
import { mockGroupItems } from "@/data/gruposMock";

export default function ActivityDetailPage({ params }: { params: { activityId: string } }) {
  const activityId = params.activityId;

  return (
    <ActivityClientPage
      activityId={activityId}
      activities={mockActivityItems}
      groups={mockGroupItems}
    />
  );
}
