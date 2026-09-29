// utils/authEvents.ts

type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export const authEvents = {
  // Suscribir un callback que se ejecutará cuando la sesión expire
  onSessionExpired(callback: SessionExpiredListener) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },

  // Disparar la alerta de sesión expirada
  emitSessionExpired() {
    listeners.forEach((listener) => listener());
  },
};