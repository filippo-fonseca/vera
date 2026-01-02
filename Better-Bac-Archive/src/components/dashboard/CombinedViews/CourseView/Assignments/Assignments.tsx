import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import Calendar from "@BetterBac/components/dashboard/Calendar";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";
import ViewSwitcher from "./ViewSwitcher";
import { useAssignmentsTabStore } from "@BetterBac/state/CourseView/AssignmentsTab.store";
import { AssignmentsTabState } from "@BetterBac/lib/GlobalTypes";
import AssignmentPreviewElem from "../Misc/AssignmentPreviewElem";

const Assignments = () => {
    const generalStore = useGeneralStore();
    const assignmentsTabStore = useAssignmentsTabStore();

    const isCalendar = React.useMemo(
        () =>
            assignmentsTabStore.assignmentsTabState ==
            AssignmentsTabState.CALENDAR_VIEW,
        [assignmentsTabStore.assignmentsTabState]
    );

    return (
        <div
            className={`flex-1 h-full flex items-center ${
                isCalendar && "justify-between"
            } flex-col w-full p-6 bg-white border rounded-xl shadow-md`}
        >
            <div className="flex items-center justify-between w-full">
                <CustomText className="text-xl font-bold">
                    {isCalendar ? "Calendar View" : "Assignment Log"}
                </CustomText>
                <ViewSwitcher />
            </div>
            <div className="w-full mb-10">
                {isCalendar ? (
                    <Calendar isCourse />
                ) : (
                    <div className="mt-3 flex flex-col gap-3">
                        {generalStore.activeCourseAssignments.map(
                            (assignment, idx) => {
                                return (
                                    <AssignmentPreviewElem
                                        {...assignment}
                                        key={idx}
                                    />
                                );
                            }
                        )}
                    </div>
                )}
            </div>
            {isCalendar && <p>footer</p>}
        </div>
    );
};

export default observer(Assignments);
