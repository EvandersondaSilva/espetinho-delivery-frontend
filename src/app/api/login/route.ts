import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api";
import { AuthResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Fazer requisição para o backend
    const response = await apiClient<AuthResponse>("/session", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Salvar token no cookie HTTP-only
    const cookieStore = await cookies();
    cookieStore.set("authToken", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    // Retornar dados do usuário (sem o token)
    return NextResponse.json({
      id: response.id,
      name: response.name,
      role: response.role,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}