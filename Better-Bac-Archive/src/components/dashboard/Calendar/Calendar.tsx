import React, { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomText from "@BetterBac/components/common/CustomText";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import { IAssignment, Tabs } from "@BetterBac/lib/GlobalTypes";
import CustomDiv from "@BetterBac/components/common/CustomDiv";

interface ICalendar {
    isCourse?: boolean;
}

const Calendar = (props: ICalendar) => {
    const generalStore = useGeneralStore();
    const [currentDate, setCurrentDate] = useState(dayjs());

    const handlePrevTwoWeeks = () => {
        setCurrentDate(currentDate.subtract(14, "day"));
    };

    const handleNextTwoWeeks = () => {
        setCurrentDate(currentDate.add(14, "day"));
    };

    const startOfPeriod = currentDate;
    const endOfPeriod = currentDate.add(13, "day");

    const calendarDays = [];
    let day = startOfPeriod;

    while (day.isBefore(endOfPeriod, "day") || day.isSame(endOfPeriod, "day")) {
        calendarDays.push(day);
        day = day.add(1, "day");
    }

    const dayHeaders = calendarDays.slice(0, 7).map(day => day.format("ddd"));

    const getAssignmentsForDate = (date: Date): IAssignment[] => {
        const targetDate = dayjs(date).startOf("day");

        if (props.isCourse) {
            return generalStore.activeCourseAssignments?.filter(assignment => {
                const assignmentDate = dayjs
                    .unix(assignment.dueDate["seconds"])
                    .startOf("day");
                return assignmentDate.isSame(targetDate);
            });
        } else {
            return generalStore.allAssignments?.filter(assignment => {
                const assignmentDate = dayjs
                    .unix(assignment.dueDate["seconds"])
                    .startOf("day");
                return assignmentDate.isSame(targetDate);
            });
        }
    };

    const getCourseColor = (linkedCourseId: string): string => {
        const course = generalStore.userCourses.find(
            course => course.id === linkedCourseId
        );
        return course ? course.courseColor : "#ffffff"; // Default color if course not found
    };

    return (
        <>
            <div className="calendar-header flex justify-between items-center mb-4 w-full">
                <button onClick={handlePrevTwoWeeks} className="btn">
                    <ChevronLeft />
                </button>
                <div className="font-bold text-lg">
                    {startOfPeriod.format("MMM D")} -{" "}
                    {endOfPeriod.format("MMM D, YYYY")}
                </div>
                <button onClick={handleNextTwoWeeks} className="btn">
                    <ChevronRight />
                </button>
            </div>
            <div className="calendar-grid grid grid-cols-7 gap-2 w-full">
                {dayHeaders.map((day, index) => (
                    <div
                        key={index}
                        className="calendar-day-header text-center font-bold"
                    >
                        {day}
                    </div>
                ))}
                {calendarDays.map((day, index) => {
                    const isToday = day.isSame(dayjs(), "day");
                    const hasFormative = false;

                    return (
                        <CustomDiv
                            key={index}
                            className={`calendar-day relative h-32 rounded-xl ${
                                isToday ? "border-2" : "border"
                            } ${
                                day.month() === currentDate.month()
                                    ? "bg-white"
                                    : "bg-gray-100"
                            }`}
                            style={{
                                borderColor:
                                    isToday && props.isCourse
                                        ? generalStore.activeCourse?.courseColor
                                        : isToday && "#ec4899",
                            }}
                        >
                            <CustomDiv
                                className={`absolute top-2 left-2 text-xs font-medium ${
                                    hasFormative &&
                                    "bg-blue-600 size-6 flex items-center justify-center rounded-full"
                                }`}
                            >
                                <CustomText
                                    className={`${
                                        hasFormative && "text-white"
                                    }`}
                                >
                                    {day.date()}
                                </CustomText>
                            </CustomDiv>
                            {getAssignmentsForDate(day.toDate())?.map(
                                (assignment, idx) => {
                                    const courseColor = getCourseColor(
                                        assignment.linkedCourseId
                                    );
                                    const dueDate = new Date(
                                        assignment.dueDate["seconds"] * 1000
                                    );
                                    const formattedDueDate =
                                        dayjs(dueDate).format("h:mma");

                                    const linkedCourse =
                                        generalStore.userCourses.find(
                                            course =>
                                                course.id ===
                                                assignment.linkedCourseId
                                        );

                                    return (
                                        <CustomDiv
                                            key={idx}
                                            className="mt-8 mx-1 cursor-pointer border p-1 rounded-md shadow-md"
                                            onClick={() => {
                                                if (
                                                    !generalStore.activeCourse
                                                ) {
                                                    generalStore.setCurrentTab(
                                                        Tabs.COURSES
                                                    );
                                                    generalStore.setActiveCourse(
                                                        linkedCourse
                                                    );
                                                }
                                                generalStore.setExpandedAssignment(
                                                    assignment
                                                );
                                            }}
                                            style={{
                                                backgroundColor:
                                                    courseColor + "4D",
                                                borderColor: courseColor,
                                                color: courseColor,
                                            }}
                                        >
                                            <CustomDiv className="text-[10px] font-medium truncate-lines">
                                                <span className="font-bold">
                                                    {formattedDueDate}
                                                </span>{" "}
                                                {assignment.title}
                                            </CustomDiv>
                                        </CustomDiv>
                                    );
                                }
                            )}
                        </CustomDiv>
                    );
                })}
            </div>
        </>
    );
};

export default observer(Calendar);
