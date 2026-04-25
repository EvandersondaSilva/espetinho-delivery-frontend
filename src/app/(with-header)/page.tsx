import Image from "next/image";
import { getAllCategories } from "@/services/catetory";
import { getproductsByCategoryId } from "@/services/product";
import { ProductCard } from "@/components/homeCards/productCard";
import logo from "@/assets/logo espetinho.jpeg";

export default async function Home() {
  const categories = await getAllCategories();

  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await getproductsByCategoryId(category.id);
      return {
        ...category,
        products: products.filter((product) => product.available),
      };
    })
  );

  const categoriesWithAvailableProducts = categoriesWithProducts.filter(
    (category) => category.products.length > 0
  );

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

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {categoriesWithAvailableProducts.map((category) => (
          <div key={category.id} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}

        {categoriesWithAvailableProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum produto disponível no momento.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
