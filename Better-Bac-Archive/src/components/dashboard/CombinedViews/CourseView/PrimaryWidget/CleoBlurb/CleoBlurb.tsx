import { cn } from "@BetterBac/lib/utils";
import { ChevronRight } from "lucide-react";
import AnimatedGradientText from "./AnimatedGradientText";
import { useGeneralStore } from "@BetterBac/state/General.store";

export default function CleoBlurb() {
    const generalStore = useGeneralStore();
    const courseColor = generalStore.activeCourse?.courseColor || "#9c40ff"; // Default to purple if no course color

    const gradientStyle = {
        "--gradient-from": courseColor,
        "--gradient-via": lightenColor(courseColor, 20),
        "--gradient-to": lightenColor(courseColor, 40),
    } as React.CSSProperties;

    return (
        <div className="flex items-center justify-center cursor-pointer hover:opacity-80">
            <AnimatedGradientText>
                <span
                    className={cn(
                        `inline animate-gradient bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                    )}
                    style={gradientStyle}
                >
                    Advice from Cleo (add accent color for each course)
                </span>
                <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedGradientText>
        </div>
    );
}

function lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00ff) + amt,
        B = (num & 0x0000ff) + amt;
    return (
        "#" +
        (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
            .toString(16)
            .slice(1)
            .toUpperCase()
    );
}
