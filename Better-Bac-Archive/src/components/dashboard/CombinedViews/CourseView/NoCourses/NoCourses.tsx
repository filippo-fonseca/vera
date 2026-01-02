import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import SquirrelEmpty from "@BetterBac/components/common/SquirrelEmpty";
import { useJoinCourseStore } from "@BetterBac/state/CourseView/JoinCourse.store";
import { Squirrel, Nut } from "lucide-react";
import { observer } from "mobx-react";
import React from "react";

const NoCourses = () => {
    const joinCourseStore = useJoinCourseStore();

    return (
        <div className="px-6 flex items-center justify-center bg-white rounded-lg shadow-lg ml-3 h-full overflow-y-scroll">
            <CustomDiv className="text-gray-600 flex flex-col items-center gap-4 justify justify-center mb-10">
                <SquirrelEmpty
                    header="Looks like you haven't joined any courses yet."
                    subHeader="Not to worry! You can either ask a teacher to add you to a course themselves or provide us with a code."
                />
                <CustomButton
                    onClick={() =>
                        joinCourseStore.setIsJoinCourseDialogOpen(true)
                    }
                >
                    Join with a code
                </CustomButton>
            </CustomDiv>
        </div>
    );
};

export default observer(NoCourses);
