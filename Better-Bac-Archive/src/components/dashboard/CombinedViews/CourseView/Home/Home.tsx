import CustomText from "@BetterBac/components/common/CustomText/CustomText";
import Calendar from "@BetterBac/components/dashboard/Calendar";
import DensityDistributionRadarChart from "@BetterBac/components/dashboard/CombinedViews/CourseView/OverviewWidget/DensityDistributionRadarChart";
import GradeChart from "@BetterBac/components/dashboard/CombinedViews/CourseView/OverviewWidget/GradeChart";
import {
    ActiveCourseDashboardState,
    AssignmentsTabState,
    IAssignment,
} from "@BetterBac/lib/GlobalTypes";
import { useGeneralStore } from "@BetterBac/state/General.store";
import React from "react";
import AssignmentPreviewElem from "../Misc/AssignmentPreviewElem";
import { observer } from "mobx-react";
import { useAssignmentsTabStore } from "@BetterBac/state/CourseView/AssignmentsTab.store";

const Home = () => {
    const generalStore = useGeneralStore();
    const assignmentsTabStore = useAssignmentsTabStore();

    // Sort assignments by due date (earliest due date first)
    const sortedAssignments = generalStore.activeCourseAssignments
        ?.slice()
        .sort((a, b) => {
            const dateA = new Date(a.dueDate["seconds"] * 1000); // Adjust if dueDate is not a Date object
            const dateB = new Date(b.dueDate["seconds"] * 1000); // Adjust if dueDate is not a Date object
            return dateB.getTime() - dateA.getTime();
        });

    return (
        <>
            <div className="flex flex-wrap">
                <div className="w-full 2xl:w-[65%] mb-3">
                    <div className="p-6 bg-white border rounded-xl shadow-md h-full">
                        <div className="mb-3">
                            <CustomText className="text-xl font-bold">
                                Upcoming
                            </CustomText>
                        </div>
                        <Calendar isCourse />
                    </div>
                </div>
                <div className="w-full 2xl:w-[35%] mb-3 max-h-[450px]">
                    <div className="flex flex-col pt-6 px-6 pb-3 justify-between 2xl:ml-3 bg-white border rounded-xl shadow-md h-full">
                        <div>
                            <CustomText className="text-xl font-bold">
                                Assignment Log
                            </CustomText>
                            {/* Add expansion button to go to assignments tab */}
                            <div className="mt-3 flex flex-col gap-3">
                                {sortedAssignments?.map(
                                    (elem: IAssignment, idx: number) => (
                                        <AssignmentPreviewElem
                                            {...elem}
                                            key={idx}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                        <div
                            className="flex items-center justify-end mt-4"
                            onClick={() => {
                                generalStore.setActiveCourseDashboardState(
                                    ActiveCourseDashboardState.ASSIGNMENTS
                                );

                                assignmentsTabStore.setAssignmentsTabState(
                                    AssignmentsTabState.LIST_VIEW
                                );
                            }}
                        >
                            <CustomText className="text-sm text-gray-700 cursor-pointer hover:font-medium hover:underline">
                                See all →
                            </CustomText>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-3 flex-1 p-6 bg-white border rounded-xl shadow-md">
                <CustomText className="text-xl font-bold">Overview</CustomText>
                <div className="flex flex-col sm:flex-col md:flex-row mt-3 gap-3 h-full">
                    <GradeChart />
                    <DensityDistributionRadarChart />
                </div>
            </div>
        </>
    );
};

export default observer(Home);
