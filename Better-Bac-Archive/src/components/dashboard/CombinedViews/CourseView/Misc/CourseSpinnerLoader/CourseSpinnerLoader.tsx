import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";

const CourseSpinnerLoader = () => {
    const generalStore = useGeneralStore();

    return (
        <div className="flex items-center justify-center h-64">
            <div
                className="animate-spin rounded-full h-6 w-6 border-t-2 border-r-2"
                style={{
                    borderColor: generalStore.activeCourse.courseColor,
                }}
            ></div>
        </div>
    );
};

export default observer(CourseSpinnerLoader);
