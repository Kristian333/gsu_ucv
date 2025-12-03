// app/grupo/[groupId]/page.tsx
import GroupClientPage from "@/components/ui/grupo";

export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
  return <GroupClientPage groupId={params.groupId} />;
}