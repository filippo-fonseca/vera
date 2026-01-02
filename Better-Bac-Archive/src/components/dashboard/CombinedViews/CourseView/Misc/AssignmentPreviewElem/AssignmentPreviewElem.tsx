import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Card } from "@BetterBac/components/common/Card";
import CustomText from "@BetterBac/components/common/CustomText";
import GradeDisplay from "./GradeDisplay";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { IAssignment, Tabs } from "@BetterBac/lib/GlobalTypes";
import { getAssignmentInstanceData } from "@BetterBac/lib/extraUtils/getAssignmentInstanceData";
import { useAuthStore } from "@BetterBac/state/Auth.store";

interface IAssignmentPreviewElem extends IAssignment {
    isLarge?: boolean;
}

export default function AssignmentPreviewElem(
    assignment: IAssignmentPreviewElem
) {
    const authStore = useAuthStore();
    const generalStore = useGeneralStore();

    const [dueDate, setDueDate] = useState<Date>(null);

    const assignmentInstance = getAssignmentInstanceData({
        assignmentInstances: generalStore.activeCourseAssignmentInstances,
        linkedAssignmentId: assignment.id,
        linkedStudentId: authStore.user.id,
    });

    const linkedCourse = generalStore.userCourses.find(
        course => course.id === assignment.linkedCourseId
    );

    const [borderColor, setBorderColor] = useState<string>("#e5e7eb");
    const [statusText, setStatusText] = useState<string>("");

    useEffect(() => {
        if (assignment.dueDate && assignment.dueDate["seconds"]) {
            setDueDate(new Date(assignment.dueDate["seconds"] * 1000));
        }
    }, [assignment.dueDate]);

    const submittedDate = assignmentInstance?.dateSubmitted
        ? new Date(assignmentInstance?.dateSubmitted["seconds"] * 1000)
        : null;

    const formattedDueDate = dayjs(dueDate).format("MMM D [at] h:mma");

    const marksOutOfTotal =
        assignmentInstance?.marksObtained + "/" + assignment.totalMarks;

    useEffect(() => {
        if (assignment.requiresSubmission) {
            if (dayjs().isAfter(dueDate) && !assignmentInstance?.isSubmitted) {
                setBorderColor("#ef4444");
                setStatusText("Late");
            } else if (
                submittedDate &&
                dayjs(submittedDate).isAfter(dueDate) &&
                assignmentInstance?.isSubmitted
            ) {
                setBorderColor("#f97316");
                setStatusText("Turned in late");
            } else if (assignmentInstance?.isSubmitted) {
                setBorderColor("#e5e7eb");
                setStatusText("");
            }
        }
    }, [assignment, dueDate, submittedDate]);

    const indicatorColor =
        assignmentInstance?.marksObtained ||
        (!assignment.requiresSubmission &&
            !assignmentInstance?.marksObtained) ||
        (assignment.requiresSubmission && assignmentInstance?.isSubmitted)
            ? "#e5e7eb"
            : borderColor == "red"
            ? "#ef4444"
            : "black";

    return (
        <Card
            onClick={() => {
                if (!generalStore.activeCourse) {
                    generalStore.setCurrentTab(Tabs.COURSES);
                    generalStore.setActiveCourse(linkedCourse);
                }
                generalStore.setExpandedAssignment(assignment);
            }}
            className={`flex items-center justify-between p-3 cursor-pointer border ${
                statusText == "Late"
                    ? "border-red-500 border-2"
                    : statusText == "Turned in late"
                    ? "border-orange-500"
                    : "border-gray-300"
            } transition-transform transform hover:scale-[1.01]`}
        >
            <CustomDiv className="flex justify-start max-w-fit gap-2">
                <CustomDiv
                    className={`flex flex-col justify-between leading-[0.5rem] ${
                        statusText ? "gap-1" : "gap-0.5"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <CustomText
                            className={`${
                                assignment.isLarge ? "text-lg" : "text-sm"
                            } font-semibold truncate-to-one-line`}
                        >
                            {assignment.title}
                        </CustomText>
                        <CustomDiv
                            className="flex items-center justify-center px-1.5 py-[0.2rem] border-2 rounded-lg max-w-fit"
                            style={{
                                backgroundColor:
                                    (statusText
                                        ? borderColor
                                        : linkedCourse?.courseColor) + "4D",
                                borderColor: statusText
                                    ? borderColor
                                    : linkedCourse?.courseColor,
                            }}
                        >
                            <CustomText
                                className={`${
                                    assignment.isLarge
                                        ? "text-xs"
                                        : "text-[10px]"
                                } font-semibold`}
                                style={{
                                    color: statusText
                                        ? borderColor
                                        : linkedCourse?.courseColor,
                                }}
                            >
                                Summative
                            </CustomText>
                        </CustomDiv>
                    </div>
                    <div className="flex items-center gap-1">
                        {assignment.isLarge ? (
                            <CustomText className="text-sm font-medium text-gray-600 truncate-to-one-line">
                                {generalStore.activeCourse?.name}
                            </CustomText>
                        ) : (
                            <>
                                {" "}
                                <CustomText className="text-xs text-gray-600 truncate-to-one-line">
                                    {formattedDueDate}
                                </CustomText>
                                {statusText && (
                                    <CustomText
                                        className="text-xs mt-2 font-medium truncate-to-one-line"
                                        style={{ color: borderColor }}
                                    >
                                        • {statusText}
                                    </CustomText>
                                )}
                            </>
                        )}
                    </div>
                </CustomDiv>
            </CustomDiv>
            <CustomDiv className="flex items-center gap-4">
                {generalStore.expandedAssignment &&
                !assignmentInstance?.isSubmitted &&
                !assignmentInstance?.marksObtained ? null : (
                    <div
                        className={`border shadow-sm ${
                            !assignmentInstance?.marksObtained &&
                            "hover:opacity-50"
                        } px-2 py-1 rounded-lg`}
                        style={{
                            borderWidth: 1,
                            borderColor: indicatorColor,
                            color:
                                assignmentInstance?.marksObtained ||
                                (!assignment.requiresSubmission &&
                                    !assignmentInstance?.marksObtained) ||
                                (assignment.requiresSubmission &&
                                    assignmentInstance?.isSubmitted)
                                    ? "black"
                                    : "white",
                            backgroundColor:
                                assignmentInstance?.marksObtained ||
                                (!assignment.requiresSubmission &&
                                    !assignmentInstance?.marksObtained) ||
                                (assignment.requiresSubmission &&
                                    assignmentInstance?.isSubmitted)
                                    ? "white"
                                    : indicatorColor,
                            opacity:
                                (assignmentInstance?.isSubmitted &&
                                    !assignmentInstance?.marksObtained) ||
                                (!assignment.requiresSubmission &&
                                    !assignmentInstance?.marksObtained)
                                    ? 0.5
                                    : 1,
                        }}
                    >
                        {" "}
                        {assignment.requiresSubmission ? (
                            <CustomText className="text-xs font-semibold">
                                {assignmentInstance?.isSubmitted
                                    ? assignmentInstance?.marksObtained
                                        ? marksOutOfTotal
                                        : "Submitted"
                                    : "Submit"}
                            </CustomText>
                        ) : (
                            <CustomText className="text-xs font-semibold">
                                {assignmentInstance?.marksObtained
                                    ? marksOutOfTotal
                                    : "No grade yet"}
                            </CustomText>
                        )}
                    </div>
                )}
                {assignmentInstance?.marksObtained && (
                    <>
                        <CustomDiv className="h-8 w-[1px] bg-gray-200" />
                        <GradeDisplay
                            marksObtained={assignmentInstance?.marksObtained}
                            totalMarks={assignment.totalMarks}
                            courseColor={linkedCourse?.courseColor}
                            color={borderColor}
                        />
                    </>
                )}
            </CustomDiv>
        </Card>
    );
}
