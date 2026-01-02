import dayjs from "dayjs";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";
import Calendar from "../Calendar";
import AssignmentPreviewElem from "./CourseView/Misc/AssignmentPreviewElem";
import { IAssignment } from "@BetterBac/lib/GlobalTypes";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import { PartyPopper } from "lucide-react";
import CustomText from "@BetterBac/components/common/CustomText";

const LifeOS = () => {
    const generalStore = useGeneralStore();

    // Get the current time in seconds
    const currentSeconds = dayjs().unix();

    // Filter the assignments to only include upcoming ones
    const upcomingAssignments = generalStore.allAssignments?.filter(
        (assignment: IAssignment) => {
            // Get the due date in seconds from Firebase timestamp
            const dueDateSeconds = assignment.dueDate["seconds"];
            return currentSeconds <= dueDateSeconds;
        }
    );

    return (
        <div className="h-full flex flex-col">
            <div className="calendar-container ml-3 p-6 bg-white border rounded-xl">
                <Calendar />
            </div>
            {/* Display Courses */}
            <div className="mt-4 ml-3 p-4 flex-1 bg-white rounded-xl shadow-md border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Upcoming</h2>
                <ul className="space-y-4">
                    <div className="mt-3 flex flex-col gap-3">
                        {upcomingAssignments?.length == 0 ? (
                            <CustomDiv className="text-gray-600 flex flex-col items-center gap-2 justify justify-center mt-10">
                                <PartyPopper className="size-10" />
                                <CustomText className="text-sm font-medium mt-6">
                                    Hooray! You have no assignments due in the
                                    future.
                                </CustomText>
                            </CustomDiv>
                        ) : (
                            upcomingAssignments?.map(
                                (elem: IAssignment, idx: number) => (
                                    <AssignmentPreviewElem
                                        {...elem}
                                        key={idx}
                                    />
                                )
                            )
                        )}
                    </div>
                </ul>
            </div>
        </div>
    );
};

export default observer(LifeOS);
