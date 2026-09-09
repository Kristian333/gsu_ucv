// /app/admingroup/dashboard/page.tsx
import React from "react";
import { Metadata } from "next";
import { GroupDashboardContent } from "@/components/ui/group-dashboard-content";

export const metadata: Metadata = {
  title: "Panel de Gestión de Grupo de Extensión | GSU",
  description: "Lista completa de nuestros grupos de extensión universitaria.",
};

export default function DashboardPage() {
  return <GroupDashboardContent />;
}