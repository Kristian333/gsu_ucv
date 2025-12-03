// app/actividad/[activityId]/page.tsx
// Este es un Server Component por defecto

import ActivityClientPage from "@/components/ui/actividad";

export default function ActivityDetailPage({ params }: { params: { activityId: string } }) {
  // ✅ Pasa el activityId a un Client Component
  return <ActivityClientPage activityId={params.activityId} />;
}