import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/homeCards/ProductCardSkeleton";

const CARDS = 4;

export function CombosSectionSkeleton() {
    return (
        <section className="max-w-6xl mx-auto px-4 pb-8">
            <Skeleton className="h-7 w-32 mb-6 mx-auto md:mx-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: CARDS }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        </section>
    );
}
