import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";
import AssignmentPreviewElem from "../../Misc/AssignmentPreviewElem";

const ExpandedAssignmentHeader = () => {
    const generalStore = useGeneralStore();

    return (
        // <CustomDiv className="mt-4 flex items-center justify-between h-16">
        //     <CustomDiv className="flex flex-col gap-2">
        //         <CustomDiv>
        //             <CustomText className="text-xl font-semibold">
        //                 {generalStore.expandedAssignment.title}
        //             </CustomText>
        //             {/* <CustomText className="text-sm text-gray-600">
        //                 {generalStore.expandedAssignment.description}
        //             </CustomText> */}
        //         </CustomDiv>
        //         <CustomDiv
        //             className="flex items-center justify-center px-1.5 h-6 border-2 rounded-lg max-w-fit"
        //             style={{
        //                 backgroundColor:
        //                     generalStore.activeCourse.courseColor + "4D",
        //                 borderColor: generalStore.activeCourse.courseColor,
        //             }}
        //         >
        //             <CustomText
        //                 className="text-xs font-semibold"
        //                 style={{
        //                     color: generalStore.activeCourse.courseColor,
        //                 }}
        //             >
        //                 Summative
        //             </CustomText>
        //         </CustomDiv>
        //     </CustomDiv>
        //     <CustomDiv className="flex flex-col items-center justify-center border rounded-xl shadow-md size-20 h-full leading-[0.5rem]">
        //         {" "}
        //         {/* Ensure it takes full height */}
        //         <CustomText className="text-xs font-medium">Jul</CustomText>
        //         <CustomText className="text-2xl font-medium">31</CustomText>
        //     </CustomDiv>
        // </CustomDiv>
        <CustomDiv className="mt-4">
            <AssignmentPreviewElem
                isLarge
                {...generalStore.expandedAssignment}
            />
        </CustomDiv>
    );
};

export default observer(ExpandedAssignmentHeader);
