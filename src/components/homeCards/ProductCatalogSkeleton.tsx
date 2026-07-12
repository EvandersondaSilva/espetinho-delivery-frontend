import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/homeCards/ProductCardSkeleton";

const SKELETON_SECTIONS = 2;
const CARDS_PER_SECTION = 4;

export function ProductCatalogSkeleton() {
    return (
        <section className="max-w-6xl mx-auto px-4 pb-16">
            {Array.from({ length: SKELETON_SECTIONS }).map((_, sectionIndex) => (
                <div key={sectionIndex} className="mb-12">
                    <Skeleton className="h-8 w-48 mb-6 mx-auto md:mx-0" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: CARDS_PER_SECTION }).map((_, cardIndex) => (
                            <ProductCardSkeleton key={cardIndex} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
