const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateReceiptFile(file: File): string | null {
    if (!file.type.startsWith("image/")) {
        return "Envie uma imagem (JPG, PNG, etc).";
    }

    if (file.size > MAX_FILE_SIZE) {
        return "A imagem deve ter no máximo 5MB.";
    }

    return null;
}

export async function uploadToCloudinary(file: File): Promise<string> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Upload de comprovante não configurado.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Falha ao enviar comprovante. Tente novamente.");
    }

    const data = await response.json();

    return data.secure_url as string;
}
