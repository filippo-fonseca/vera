import CustomText from "@BetterBac/components/common/CustomText";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";

const GradeBoundaries = () => {
    const generalStore = useGeneralStore();
    const { IBGradeBoundaries, name } = generalStore.activeCourse || {};

    // If no course or boundaries are available, show a loading message
    if (!IBGradeBoundaries) {
        return (
            <div className="flex-1 h-full flex items-center justify-center w-full p-6 bg-white border rounded-xl shadow-md">
                <p>Loading grade boundaries...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full flex flex-col justify-between w-full p-6 bg-white border rounded-xl shadow-md">
            <div>
                <CustomText className="text-xl font-bold">
                    Minimum grade boundaries
                </CustomText>
                <div className="flex flex-wrap items-center gap-6 my-6">
                    {Object.entries(IBGradeBoundaries).map(
                        ([grade, minPercentage]) => (
                            <div
                                key={grade}
                                className="flex-1 min-w-[120px] max-w-[140px] flex flex-col items-center justify-center border h-20 rounded-xl shadow-md"
                            >
                                <div className="font-semibold">{grade}</div>
                                <div>{minPercentage}%</div>
                            </div>
                        )
                    )}
                </div>
            </div>
            <CustomText className="text-sm mt-4 text-gray-600 font-medium">
                Note These boundaries are set by your teacher/school and in no
                way reflect the actual IB grade boundaries for this course.
            </CustomText>
        </div>
    );
};

export default observer(GradeBoundaries);
