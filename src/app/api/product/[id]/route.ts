import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params; // Next.js 15+ params é assíncrono

    const formData = await request.formData();

    // log para ver o que está chegando
    console.log("formData entries:");
    for (const [key, value] of formData.entries()) {
        console.log(key, value);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();


    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
}