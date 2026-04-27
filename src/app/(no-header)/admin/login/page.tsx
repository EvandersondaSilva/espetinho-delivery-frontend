"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { handleAutoLogout } from "@/actions/auth";
import logoLogin from "@/assets/logo login.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth(false);

  // Detectar navegação de volta
  const handleBack = async () => {
    if (isAuthenticated) {
      // Se estiver autenticado, fazer logout automático
      await handleAutoLogout();
      await logout();
    }
  };

  useBackNavigation(handleBack);

  // Se usuário já está autenticado ao acessar login, fazer logout automático
  useEffect(() => {
    if (isAuthenticated) {
      handleAutoLogout().then(() => {
        logout();
      });
    }
  }, [isAuthenticated, logout]);

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email e senha são obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        router.push("/admin/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao fazer login");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-#0F0F0F px-4 py-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={async () => {
          await handleBack();
          router.push("/");
        }}
        className="absolute top-4 left-4 text-white hover:bg-white/15"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <Card className="w-full max-w-md shadow-2xl">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src={logoLogin}
              alt="Logo Login"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          <form onSubmit={loginUser} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Painel de administração do Espetinho
          </p>
        </div>
      </Card>
    </div>
  );
}
