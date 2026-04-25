import { Separator } from "@/components/ui/separator";
import { Flame } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-red-600 text-white">
            <Separator className="bg-red-500" />
            <div className="h-17.5 flex items-center justify-center px-4">
                <p className="flex items-center gap-2 text-sm text-red-100 tracking-wide">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span>
                        desenvolvido por{" "}
                        <span className="font-bold text-white uppercase tracking-widest">
                            Evn
                        </span>
                    </span>
                    <span className="text-red-400 mx-1">·</span>
                    <span className="text-red-200">© {currentYear}</span>
                </p>
            </div>
        </footer>
    );
}