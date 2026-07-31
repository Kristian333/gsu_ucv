// /app/context/auth-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = "root" | "deu_admin" | "faculty_admin" | "group_admin" | "group_helper";

export interface AuthUser {
    id: string;
    name: string;
    correo: string;
    avatar: string;
    roles: string[];
    group?: string;
    groupId?: string;
    facultad?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    login: (user: AuthUser, token?: string) => void;
    logout: () => void;
    isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("auth-user");
        const storedToken = localStorage.getItem("token");
        if (stored) {
            try {
                const u = JSON.parse(stored) as AuthUser;
                setUser(u);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error cargando sesión:", error);
            }
        }

        if (storedToken) {
            setToken(storedToken);
        }

        setIsHydrated(true);
    }, []);

    const login = (user: AuthUser, newToken?: string) => {
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("auth-user", JSON.stringify(user));

        // Si pasamos el token en login, lo guardamos
        if (newToken) {
            setToken(newToken);
            localStorage.setItem("token", newToken);
        } else {
        // Si ya fue guardado en localStorage externamente (ej: login-form), lo leemos
            const currentToken = localStorage.getItem("token");
            if (currentToken) setToken(currentToken);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem("auth-user");
        localStorage.removeItem("token");
        localStorage.removeItem("group_id");
        localStorage.removeItem("facultad");
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, isHydrated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}