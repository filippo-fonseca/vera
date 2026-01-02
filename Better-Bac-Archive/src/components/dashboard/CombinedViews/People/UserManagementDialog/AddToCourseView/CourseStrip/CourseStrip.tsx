import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import Pfp from "@BetterBac/components/common/Pfp/Pfp";
import { getCourseIconFromNumber } from "@BetterBac/lib/extraUtils/getCourseIconComponent";
import { ICourse, IUser } from "@BetterBac/lib/GlobalTypes";
import React from "react";

interface ICourseStrip {
    course: ICourse;
    educator: IUser;
    rightChild: React.ReactNode;
    onClick?: () => void;
    addedClassName?: string;
}

const CourseStrip = (props: ICourseStrip) => {
    const CourseIcon = getCourseIconFromNumber(props.course.iconNumber);
    return (
        <div
            onClick={props.onClick}
            className={`${props.addedClassName} flex items-center justify-between border px-2 py-4 rounded-xl hover:shadow-md hover:border-black cursor-pointer transition-transform transform hover:scale-[1.01]`}
        >
            <div className="flex items-center">
                <CustomDiv
                    className={`bg-white shadow-md border-[3px] h-[34px] w-[34px] rounded-xl flex items-center justify-center`}
                    style={{
                        borderColor: props.course.courseColor,
                    }} //TODO: Add proper accent color from backend to border
                >
                    <CourseIcon className="w-3.5 h-3.5" />
                </CustomDiv>
                <div className="flex flex-col justify-between h-full ml-2 leading-[1rem]">
                    <CustomText className="font-semibold text-sm">
                        {props.course.name}
                    </CustomText>
                    <CustomDiv className="flex items-center gap-1">
                        <Pfp
                            customUser={props.educator}
                            size="size-4"
                            customTextSize="text-[6px]"
                        />
                        <CustomText className="text-xs text-gray-600">
                            {props.educator?.displayName}
                        </CustomText>
                    </CustomDiv>
                </div>
            </div>
            {props.rightChild}
        </div>
    );
};

export default CourseStrip;
