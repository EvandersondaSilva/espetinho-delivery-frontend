import { getAllCategories } from "@/services/catetory";
import { getproductsByCategoryId } from "@/services/product";
import { ProductSearch } from "@/components/homeCards/ProductSearch";

export async function ProductCatalog() {
    const categories = await getAllCategories();

    const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
            const products = await getproductsByCategoryId(category.id);
            return {
                ...category,
                products,
            };
        })
    );

    const categoriesWithProductsOnly = categoriesWithProducts.filter(
        (category) => category.products.length > 0
    );

    return (
        <section className="max-w-6xl mx-auto px-4 pb-16">
            {categoriesWithProductsOnly.length > 0 ? (
                <ProductSearch categories={categoriesWithProductsOnly} />
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                        Nenhum produto disponível no momento.
                    </p>
                </div>
            )}
        </section>
    );
}
