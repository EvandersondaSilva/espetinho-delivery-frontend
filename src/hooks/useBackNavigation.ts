"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook para detectar navegação de volta e executar callback
 * Útil para logout automático quando usuário tenta voltar do login
 */
export function useBackNavigation(onBack: () => void) {
  const router = useRouter();

  useEffect(() => {
    // Detectar o evento de voltar do navegador
    const handlePopState = () => {
      onBack();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onBack]);

  /**
   * Função para simular navegação de volta programaticamente
   */
  const goBack = () => {
    onBack();
    router.back();
  };

  return { goBack };
}
