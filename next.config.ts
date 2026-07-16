import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // useImageUpload.ts já valida até 5MB no client; aqui só evitamos que o
      // limite padrão de 1MB do Server Action rejeite o upload antes disso.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;