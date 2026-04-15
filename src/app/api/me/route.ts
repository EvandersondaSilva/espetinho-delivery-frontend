import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api";
import { User } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Verificar token com o backend
    const response = await apiClient<User>("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);

    // Se o token for inválido, remover o cookie
    const cookieStore = await cookies();
    cookieStore.delete("authToken");

    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }
}