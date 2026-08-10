// utils/auth-guards.ts

export interface AuthUserLike {
  groupId?: string | number | null;
  role?: string;
  [key: string]: any;
}

/**
 * Verifica si el usuario actual pertenece al mismo grupo de la actividad.
 * Si el usuario es 'admin', se le omite la restricción automáticamente.
 */
export function validateGroupAccess(
  activity: any,
  user: AuthUserLike | null
): { hasAccess: boolean; reason?: string } {
  if (!user) {
    return { hasAccess: false, reason: 'Usuario no autenticado.' };
  }

  // El administrador general siempre tiene acceso
  if (user.role === 'admin') {
    return { hasAccess: true };
  }

  const activityGroupId = activity?.group_id ?? activity?.groupId;

  if (!activityGroupId || !user.groupId) {
    return { 
      hasAccess: false, 
      reason: 'No se pudo verificar la asociación del grupo.' 
    };
  }

  const matches = String(activityGroupId) === String(user.groupId);

  return {
    hasAccess: matches,
    reason: matches ? undefined : 'Esta actividad pertenece a otro grupo.',
  };
}