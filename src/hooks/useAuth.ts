"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, UseAuthReturn } from "@/lib/types";

/**
 * Hook para verificar autenticação
 * Redireciona para login se não houver token
 */
export function useAuth(redirectToLogin = true): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, [router, redirectToLogin]);

    const checkAuth = async () => {
        try {
            const response = await fetch("/api/me");

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Não autenticado
                setUser(null);
                if (redirectToLogin) {
                    router.push("/admin/login");
                }
            }
        } catch (error) {
            console.error("Erro ao verificar autenticação:", error);
            setUser(null);
            if (redirectToLogin) {
                router.push("/admin/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
        } catch (error) {
            console.error("Erro no logout:", error);
        } finally {
            setUser(null);
            router.push("/admin/login");
        }
    };

    return {
        user,
        token: null, // Token não é mais acessível no frontend
        loading,
        logout,
        isAuthenticated: !!user,
    };
}
