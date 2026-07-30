// /utils/redirectByRole.ts
export function getDashboardRouteByRoles(roles: string[] = []): string {
  const normalizedRoles = roles.map((r) => r.toLowerCase().trim());

  if (normalizedRoles.includes("root") || normalizedRoles.includes("deu_admin")) {
    return "/admin/dashboard";
  }
  if (normalizedRoles.includes("faculty_admin")) {
    return "/adminfacultad/dashboard";
  }
  if (
    normalizedRoles.includes("group_admin") ||
    normalizedRoles.includes("group_helper") ||
    normalizedRoles.includes("visitante")
  ) {
    return "/admingroup/dashboard";
  }

  // Cualquier otro usuario o sin roles administrativos especiales
  return "/";
}