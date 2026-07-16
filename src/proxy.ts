import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("authToken")?.value;

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const isLoginPage = request.nextUrl.pathname === "/admin/login";

    // ✅ Se já tem token e tenta acessar o login, manda pro dashboard
    if (isLoginPage && token) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // ✅ Se é rota admin, não é login, e não tem token → bloqueia
    if (isAdminRoute && !isLoginPage && !token) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"]
};
