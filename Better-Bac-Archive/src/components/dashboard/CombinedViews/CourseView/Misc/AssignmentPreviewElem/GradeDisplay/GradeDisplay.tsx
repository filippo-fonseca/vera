"use client";

import AnimatedCircularProgressBar from "@BetterBac/components/common/AnimatedCircularProgressBar";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { useEffect, useState } from "react";

interface GradeDisplayProps {
    marksObtained: number;
    totalMarks: number;
    courseColor: string;
    color?: string;
}

export default function GradeDisplay(props: GradeDisplayProps) {
    const generalStore = useGeneralStore();
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        if (props.totalMarks > 0) {
            const calculatedPercentage =
                (props.marksObtained / props.totalMarks) * 100;
            setPercentage(calculatedPercentage);
        }
    }, [props.marksObtained, props.totalMarks]);

    return (
        <AnimatedCircularProgressBar
            max={100}
            min={0}
            value={percentage}
            gaugePrimaryColor={
                props.color == "#e5e7eb" ? props.courseColor : props.color
            }
            gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
        />
    );
}
