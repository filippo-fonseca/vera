import { cn } from "@BetterBac/lib/utils";
import { useId } from "react";

interface DotPatternProps {
    width?: any;
    height?: any;
    x?: any;
    y?: any;
    cx?: any;
    cy?: any;
    cr?: any;
    className?: string;
    [key: string]: any;
}

export function DotPattern({
    width = 16,
    height = 16,
    x = 0,
    y = 0,
    cx = 1,
    cy = 1,
    cr = 1,
    className,
    ...props
}: DotPatternProps) {
    const id = useId();

    return (
        <svg
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-0 w-full h-full",
                className
            )}
            {...props}
        >
            <defs>
                <filter id={`${id}-blur`}>
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
                </filter>
                <pattern
                    id={id}
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                    patternContentUnits="userSpaceOnUse"
                    x={x}
                    y={y}
                >
                    <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
                </pattern>
            </defs>
            <rect
                width="100%"
                height="100%"
                strokeWidth={0}
                fill={`url(#${id})`}
                filter={`url(#${id}-blur)`} // Apply the blur filter to the rect
            />
        </svg>
    );
}

export default DotPattern;
