import { Separator } from "@/components/ui/separator";
import { Flame } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-red-600 text-white ">
            <Separator className="bg-red-500" />
            <div className="h-17.5 flex items-center justify-center px-4 gap-2">
                <p className="flex items-center gap-2 text-sm text-red-100 tracking-wide">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span>
                        Desenvolvido por{" "}
                        <span className="font-bold text-white tracking-widest">
                            Evn
                        </span>
                    </span>
                    <span className="text-red-300 mx-1">·</span>
                    <span className="text-red-200">© {currentYear}</span>
                </p>

                <div className="flex items-center gap-4">
                    <a href="https://www.instagram.com/evnn.dev/" target="_blank" rel="noopener noreferrer" className="text-red-100 hover:text-white transition-colors">
                        <FaInstagram className="w-5 h-5" />
                    </a>

                </div>
            </div>
        </footer>
    );
}