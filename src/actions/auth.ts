"use server";

/**
 * Faz logout do usuário removendo o token dos cookies
 * @returns Resultado da operação de logout
 */
export async function handleAutoLogout() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Erro ao fazer logout:", response.statusText);
      return { success: false, error: "Erro ao fazer logout" };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return { success: false, error: "Erro ao fazer logout" };
  }
}
