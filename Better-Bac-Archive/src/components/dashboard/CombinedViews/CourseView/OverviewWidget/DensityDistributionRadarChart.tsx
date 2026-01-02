import React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@BetterBac/components/common/Card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@BetterBac/components/common/Chart";
import { ChartConfig } from "@BetterBac/components/common/Chart/Chart";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { TrendingUp } from "lucide-react";
import { observer } from "mobx-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { calculateIBGrade } from "@BetterBac/lib/utils"; // Assuming this is your utility function
import { findAssignmentById } from "@BetterBac/lib/extraUtils/findAssignmentById";

interface IDensityDistributionRadarChart {
    isFullWidth?: boolean;
}

const DensityDistributionRadarChart = (
    props: IDensityDistributionRadarChart
) => {
    const generalStore = useGeneralStore();

    // Calculate frequency of grades with IB grade calculation
    const calculateFrequency = () => {
        const frequencyMap = new Map<string, number>();

        // Initialize frequency map with all grade levels from 1 to 7
        for (let i = 1; i <= 7; i++) {
            frequencyMap.set(i.toString(), 0);
        }

        // Count occurrences of each grade level with IB grade calculation
        generalStore.activeCourseAssignmentInstances?.forEach(
            assignmentInstance => {
                const assignment = findAssignmentById({
                    activeCourseAssignments:
                        generalStore.activeCourseAssignments,
                    linkedAssignmentId: assignmentInstance?.linkedAssignmentId,
                });

                const gradeLevel =
                    assignmentInstance.marksObtained &&
                    calculateIBGrade(
                        (assignmentInstance?.marksObtained /
                            assignment?.totalMarks) *
                            100
                    ).toString(); // Assuming gradeLevel is used for x-axis
                if (frequencyMap.has(gradeLevel)) {
                    frequencyMap.set(
                        gradeLevel,
                        frequencyMap.get(gradeLevel)! + 1
                    );
                }
            }
        );

        // Convert map to array of objects for RadarChart
        const frequencyData = Array.from(frequencyMap.entries()).map(
            ([gradeLevel, frequency]) => ({
                gradeLevel,
                frequency,
            })
        );

        return frequencyData;
    };

    const chartData = calculateFrequency();

    const chartConfig = {
        frequency: {
            label: "Frequency",
            color: generalStore.activeCourse?.courseColor,
        },
    } as ChartConfig;

    return (
        <Card
            className={`${
                props.isFullWidth ? "w-full" : "sm:w-full md:w-1/2"
            } h-[450px] flex flex-col justify-between`}
        >
            <div>
                <CardHeader className="">
                    <CardTitle>Score Distribution</CardTitle>
                    <CardDescription>
                        A visual representation of grade frequency.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-64"
                    >
                        <RadarChart data={chartData}>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />
                            <PolarAngleAxis dataKey="gradeLevel" />
                            <PolarGrid />
                            <Radar
                                dataKey="frequency"
                                fill={chartConfig.frequency.color}
                                fillOpacity={0.6}
                                dot={{
                                    r: 4,
                                    fillOpacity: 1,
                                }}
                            />
                        </RadarChart>
                    </ChartContainer>
                </CardContent>
            </div>
            <CardFooter className="flex-col gap-2 text-sm items-start">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this frequency{" "}
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex gap-2 leading-none text-muted-foreground">
                    January - June 2024
                </div>
            </CardFooter>
        </Card>
    );
};

export default observer(DensityDistributionRadarChart);
