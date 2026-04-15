import Link from "next/link";
import { Category } from "@/services/catetory"
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
    category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/category/${category.id}`} className="group block">
            <div className="relative overflow-hidden flex items-center justify-between border border-border rounded-xl p-6 bg-card text-card-foreground shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <h2 className="text-xl font-bold relative z-10">{category.name}</h2>
                <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 relative z-10">
                    <ChevronRight className="w-5 h-5" />
                </div>
            </div>
        </Link>
    );
}