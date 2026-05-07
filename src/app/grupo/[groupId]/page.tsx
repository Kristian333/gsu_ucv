// app/grupo/[groupId]/page.tsx
import GroupClientPage from "@/components/ui/grupo";
import { mockGroupItems } from "@/data/gruposMock";
import { mockActivityItems } from "@/data/actividadesMock";

export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
  const groupId = params.groupId;

  return (
    <GroupClientPage
      groupId={groupId}
      groups={mockGroupItems}
      activities={mockActivityItems}
    />
  );
}
