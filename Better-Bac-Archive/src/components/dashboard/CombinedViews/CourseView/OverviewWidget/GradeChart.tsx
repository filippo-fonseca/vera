import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@BetterBac/components/common/Chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@BetterBac/components/common/Card";
import { ChartConfig } from "@BetterBac/components/common/Chart/Chart";
import { calculateIBGrade, truncate } from "@BetterBac/lib/utils";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import { findAssignmentById } from "@BetterBac/lib/extraUtils/findAssignmentById";

const GradeChart = () => {
    const generalStore = useGeneralStore();

    // Filter and map data for the chart
    const chartData =
        generalStore.activeCourseAssignmentInstances
            ?.filter(
                assignmentInstance => assignmentInstance.marksObtained != null
            ) // Filter out assignments where marksObtained is null or undefined
            .map(assignmentInstance => {
                const assignment = findAssignmentById({
                    activeCourseAssignments:
                        generalStore.activeCourseAssignments,
                    linkedAssignmentId: assignmentInstance?.linkedAssignmentId,
                });
                return {
                    assignment: assignment?.title,
                    grade: calculateIBGrade(
                        (assignmentInstance?.marksObtained /
                            assignment?.totalMarks) *
                            100
                    ), // Assuming marksObtained is never null here
                };
            }) ?? [];

    const chartConfig = {
        grade: {
            label: "Grade",
            color: generalStore.activeCourse?.courseColor,
        },
    };

    return (
        <Card className="w-full h-[450px] flex flex-col justify-between">
            <div>
                <CardHeader>
                    <CardTitle>Grade Trend</CardTitle>
                    <CardDescription>
                        Your results from recent assignments, visualized.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={chartConfig}
                        className="flex justify-start items-center w-full max-h-64"
                    >
                        <AreaChart data={chartData} margin={{ left: -34 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="assignment"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={value => truncate(value, 9)}
                            />
                            <YAxis
                                dataKey="grade"
                                axisLine={false}
                                tickMargin={8}
                                tickLine={false}
                                ticks={[1, 2, 3, 4, 5, 6, 7]}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        hideLabel
                                    />
                                }
                            />
                            <Area
                                dataKey="grade"
                                type="linear"
                                fill="var(--color-grade)"
                                fillOpacity={0.4}
                                stroke="var(--color-grade)"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </div>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Trending up by 5.2% this assignment{" "}
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Assignment 1 - Assignment 6
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

export default observer(GradeChart);
