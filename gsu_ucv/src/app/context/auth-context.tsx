// /app/context/auth-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the type of your context, including the userRole
interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    userRole: 'admin' | 'estudiante' | null; // Add the user's role
    login: (userId: string, role: 'admin' | 'estudiante') => void; // Update the login function to accept the role
    logout: () => void;
    isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'estudiante' | null>(null); // New state for the role
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Hydrate the state from localStorage or cookies on load
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            const { userId, role } = JSON.parse(storedAuth);
            setIsAuthenticated(true);
            setUserId(userId);
            setUserRole(role); // Load the role on initial render
        }
        setIsHydrated(true); // <-- Tell the Navbar it can now render
    }, []);

    const login = (userId: string, role: 'admin' | 'estudiante') => {
        setIsAuthenticated(true);
        setUserId(userId);
        setUserRole(role); // Store the role in state
        // Persist the user data to localStorage
        localStorage.setItem('auth', JSON.stringify({ userId, role })); 
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
        localStorage.removeItem('auth');
    };

    const value = { isAuthenticated, userId, userRole, login, logout, isHydrated };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}