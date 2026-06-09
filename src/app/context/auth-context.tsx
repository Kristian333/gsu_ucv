// /app/context/auth-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = "Admin" | "Invitado" | "Grupo" | "Facultad";

interface AuthUser {
    id: string;
    name: string;
    correo: string;
    avatar: string;
    role: UserRole;
}

// Define the type of your context, including the userRole
interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
    isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("auth-user");
        if (stored) {
            const u = JSON.parse(stored) as AuthUser;
            setUser(u);
            setIsAuthenticated(true);
        }
        setIsHydrated(true);
    }, []);

    const login = (user: AuthUser) => {
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("auth-user", JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("auth-user");
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isHydrated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
