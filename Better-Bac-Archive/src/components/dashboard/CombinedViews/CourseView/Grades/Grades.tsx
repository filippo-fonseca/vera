import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import Calendar from "@BetterBac/components/dashboard/Calendar";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";
import { useAssignmentsTabStore } from "@BetterBac/state/CourseView/AssignmentsTab.store";
import {
    AssignmentsTabState,
    GradesTabState,
} from "@BetterBac/lib/GlobalTypes";
import AssignmentPreviewElem from "../Misc/AssignmentPreviewElem";
import GradeChart from "@BetterBac/components/dashboard/CombinedViews/CourseView/OverviewWidget/GradeChart";
import ViewSwitcher from "./ViewSwitcher";
import { useGradesTabStore } from "@BetterBac/state/CourseView/GradesTab.store";
import DensityDistributionRadarChart from "@BetterBac/components/dashboard/CombinedViews/CourseView/OverviewWidget/DensityDistributionRadarChart";

const Grades = () => {
    const gradesTabStore = useGradesTabStore();

    const renderer = () => {
        switch (gradesTabStore.gradesTabState) {
            case GradesTabState.TREND:
                return <GradeChart />;
            case GradesTabState.GRADE_DENSITY:
                return <DensityDistributionRadarChart isFullWidth />;
        }
    };

    return (
        <div
            className={`flex-1 h-full flex items-center ${
                // isCalendar && "justify-between"
                "justify-start"
            } flex-col w-full p-6 bg-white border rounded-xl shadow-md`}
        >
            <div className="flex items-center justify-between w-full">
                <CustomText className="text-xl font-bold">
                    Stats on your grades
                </CustomText>
                <ViewSwitcher />
            </div>
            <div className="w-full mt-4">
                <CustomDiv className="flex items-center gap-4">
                    <CustomDiv className="flex flex-col gap-2 border p-4 rounded-xl max-w-fit mb-4">
                        <CustomText className="text-md font-medium text-gray-600">
                            Semester 1 • Final
                        </CustomText>
                        <CustomDiv className="text-3xl font-bold">7</CustomDiv>
                    </CustomDiv>
                    <CustomDiv className="flex flex-col gap-2 border p-4 rounded-xl max-w-fit mb-4">
                        <CustomText className="text-md font-medium text-gray-600">
                            Semester 1 • Final
                        </CustomText>
                        <CustomDiv className="text-3xl font-bold">
                            N/A
                        </CustomDiv>
                    </CustomDiv>
                </CustomDiv>
                {renderer()}
            </div>
            {/* {isCalendar && <p>footer</p>} */}
        </div>
    );
};

export default observer(Grades);
