import { getPublicCombos } from "@/services/combo";
import { ComboCard } from "@/components/homeCards/ComboCard";

export async function CombosSection() {
    const combos = await getPublicCombos();

    if (combos.length === 0) return null;

    return (
        <section className="max-w-6xl mx-auto px-4 pb-8">
            <h2 className="text-xl font-bold mb-6 text-center md:text-left">Combos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {combos.map((combo) => (
                    <ComboCard key={combo.id} combo={combo} />
                ))}
            </div>
        </section>
    );
}
