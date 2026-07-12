import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
    return (
        <div className="bg-card border border-black/10 rounded-xl overflow-hidden">
            <div className="flex flex-row">
                <div className="p-4 flex flex-col justify-center flex-1 gap-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-5 w-20 mt-1" />
                </div>

                <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-none" />
            </div>
        </div>
    );
}
