import { Suspense } from "react";
import Image from "next/image";
import { ProductCatalog } from "@/components/homeCards/ProductCatalog";
import { ProductCatalogSkeleton } from "@/components/homeCards/ProductCatalogSkeleton";
import logo from "@/assets/logo espetinho.jpeg";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative w-full mb-12">
        <div className="w-full relative h-[90vh] min-h-100 max-h-225 mb-9">
          <Image
            src={logo}
            alt="Espetinho do Nilson Logo"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            quality={75}
          />
          <div className="absolute inset-0 bg-linear-to-t from-background to-transparent opacity-0" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center flex flex-col items-center -mt-16">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 mt-9
bg-linear-to-r from-foreground via-foreground to-red-500
bg-clip-text text-transparent drop-shadow-md">
            Explore nosso cardápio preparado com qualidade e sabor.
          </h1>
        </div>
      </section>

      <Suspense fallback={<ProductCatalogSkeleton />}>
        <ProductCatalog />
      </Suspense>
    </main>
  );
}
