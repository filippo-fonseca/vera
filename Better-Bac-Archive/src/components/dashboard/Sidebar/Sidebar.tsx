import React, { useState } from "react";
import {
    ChevronRight,
    GraduationCap,
    Home,
    ChevronLeft,
    Microscope,
    Minimize,
    Minimize2,
    School,
    University,
    User,
    Calendar,
    FolderCog,
} from "lucide-react";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { Tabs } from "@BetterBac/lib/GlobalTypes";
import { observer } from "mobx-react";
import { getCourseIconFromNumber } from "@BetterBac/lib/extraUtils/getCourseIconComponent";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import { useSchoolStore } from "@BetterBac/state/Admin/School.store";
import { SchoolDashboardState } from "@BetterBac/components/common/SubNavbar/SubNavbar";

interface SidebarProps {
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
}

interface SidebarItem {
    label: string;
    icon: JSX.Element;
    isActive: boolean;
    onClick?: () => void;
    subItems?: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
    isDropdownOpen,
    toggleDropdown,
}) => {
    const generalStore = useGeneralStore();
    const schoolStore = useSchoolStore();
    const authStore = useAuthStore();

    const [isMinimized, setIsMinimized] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    //constants:
    const isAdmin = generalStore.userSchool?.adminAccessUserIds?.includes(
        authStore.user.id
    );

    const UNSAVED_CHANGES_TO_SCHOOL: boolean =
        generalStore.currentTab == Tabs.SCHOOL &&
        generalStore.activeSchoolDashboardState !== SchoolDashboardState.HOME &&
        generalStore.activeSchoolDashboardState !==
            SchoolDashboardState.ADMINS &&
        JSON.stringify(schoolStore.localSchoolInstance) !==
            JSON.stringify(generalStore.userSchool);

    React.useEffect(() => {
        if (generalStore.currentTab !== Tabs.COURSES) {
            generalStore.setActiveCourse(null);
        }
    }, [generalStore.currentTab]);

    const studentItems: SidebarItem[] = [
        {
            label: "LifeOS",
            icon: <Home size={20} />,
            isActive: generalStore.currentTab === Tabs.LIFE_OS,
            onClick: () => generalStore.setCurrentTab(Tabs.LIFE_OS),
        },
        {
            label: "Courses",
            icon: <GraduationCap size={20} />,
            isActive: generalStore.currentTab === Tabs.COURSES,
            onClick: () => {
                generalStore.setCurrentTab(Tabs.COURSES);
                if (!generalStore.activeCourse)
                    generalStore.setActiveCourse(generalStore.userCourses[0]);
                toggleDropdown();
            },
            subItems: generalStore.userCourses?.map(course => {
                const CourseIcon = getCourseIconFromNumber(course.iconNumber);

                return {
                    label: course.name,
                    icon: (
                        <CourseIcon
                            size={isMinimized && !isHovered ? 14 : 16}
                        />
                    ), // Example icon for sub-items
                    isActive: course === generalStore.activeCourse,
                    onClick: () => {
                        generalStore.setCurrentTab(Tabs.COURSES);
                        generalStore.setActiveCourse(course);
                        generalStore.setExpandedAssignment(null);
                    },
                };
            }),
        },
        // Add more items as needed
    ];

    const adminItems: SidebarItem[] = [
        {
            label: "School",
            icon: <University size={20} />,
            isActive: generalStore.currentTab === Tabs.SCHOOL,
            onClick: () => generalStore.setCurrentTab(Tabs.SCHOOL),
        },
        {
            label: "People",
            icon: <User size={20} />,
            isActive: generalStore.currentTab === Tabs.PEOPLE,
            onClick: () => generalStore.setCurrentTab(Tabs.PEOPLE),
            // subItems: generalStore.userCourses?.map(course => {
            //     const CourseIcon = getCourseIconFromNumber(course.iconNumber);

            //     return {
            //         label: course.name,
            //         icon: (
            //             <CourseIcon
            //                 size={isMinimized && !isHovered ? 14 : 16}
            //             />
            //         ), // Example icon for sub-items
            //         isActive: course === generalStore.activeCourse,
            //         onClick: () => {
            //             generalStore.setCurrentTab(Tabs.COURSES);
            //             generalStore.setActiveCourse(course);
            //             generalStore.setExpandedAssignment(null);
            //         },
            //     };
            // }),
        },
        {
            label: "Year Batches",
            icon: <FolderCog size={20} />,
            isActive: generalStore.currentTab === Tabs.YEAR_BATCHES,
            onClick: () => generalStore.setCurrentTab(Tabs.YEAR_BATCHES),
            // subItems: generalStore.userCourses?.map(course => {
            //     const CourseIcon = getCourseIconFromNumber(course.iconNumber);

            //     return {
            //         label: course.name,
            //         icon: (
            //             <CourseIcon
            //                 size={isMinimized && !isHovered ? 14 : 16}
            //             />
            //         ), // Example icon for sub-items
            //         isActive: course === generalStore.activeCourse,
            //         onClick: () => {
            //             generalStore.setCurrentTab(Tabs.COURSES);
            //             generalStore.setActiveCourse(course);
            //             generalStore.setExpandedAssignment(null);
            //         },
            //     };
            // }),
        },
        {
            label: "Courses Admin",
            icon: <GraduationCap size={20} />,
            isActive: generalStore.currentTab === Tabs.COURSES_ADMIN_VIEW,
            onClick: () => generalStore.setCurrentTab(Tabs.COURSES_ADMIN_VIEW),
        },
        {
            label: "Reports",
            icon: <GraduationCap size={20} />,
            isActive: generalStore.currentTab === Tabs.REPORTS,
            onClick: () => generalStore.setCurrentTab(Tabs.REPORTS),
            // subItems: generalStore.userCourses?.map(course => {
            //     const CourseIcon = getCourseIconFromNumber(course.iconNumber);

            //     return {
            //         label: course.name,
            //         icon: (
            //             <CourseIcon
            //                 size={isMinimized && !isHovered ? 14 : 16}
            //             />
            //         ), // Example icon for sub-items
            //         isActive: course === generalStore.activeCourse,
            //         onClick: () => {
            //             generalStore.setCurrentTab(Tabs.COURSES);
            //             generalStore.setActiveCourse(course);
            //             generalStore.setExpandedAssignment(null);
            //         },
            //     };
            // }),
        },
        // Add more items as needed
    ];

    const items = isAdmin ? adminItems : studentItems;

    const toggleMinimized = () => {
        setIsMinimized(!isMinimized);
    };

    React.useEffect(() => {
        if (generalStore.userCourses?.length > 0) {
            generalStore.setActiveCourse(generalStore.userCourses[0]);
        }
        const savedTab = localStorage.getItem("currentTab");
        if (savedTab) {
            generalStore.setCurrentTab(savedTab as Tabs);
            if (savedTab === Tabs.COURSES) {
                if (generalStore.userCourses?.length > 0) {
                    generalStore.setActiveCourse(generalStore.userCourses[0]);
                }
            }
        } else {
            if (isAdmin) {
                generalStore.setCurrentTab(Tabs.SCHOOL);
            } else {
                generalStore.setCurrentTab(Tabs.LIFE_OS);
            }
        }
    }, []);

    // Save currentTab to localStorage whenever it changes
    React.useEffect(() => {
        localStorage.setItem("currentTab", generalStore.currentTab);
    }, [generalStore.currentTab]);

    return (
        <div
            className={`relative ${
                isMinimized && !isHovered ? "w-[75px]" : "w-64"
            } bg-white rounded-xl text-black flex flex-col p-4 gap-4 border-gray-200 border shadow-md transition-all duration-300`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`flex items-center ${
                    isMinimized && !isHovered ? "justify-center" : "justify-end"
                } w-full`}
            >
                <button
                    onClick={toggleMinimized}
                    className={`z-20 bg-gray-200 size-7 flex items-center justify-center rounded-full shadow-md focus:outline-none ${
                        isMinimized ? "bg-pink-500" : "border-none"
                    }`}
                >
                    {/* {isMinimized ? (
                        <ChevronRight size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )} */}
                    {!isMinimized ? (
                        <Minimize2 size={12} />
                    ) : (
                        <Minimize size={12} className="stroke-white" />
                    )}
                </button>
            </div>
            <CustomDiv
                className="hs-accordion-group w-full flex flex-col flex-wrap"
                data-hs-accordion-always-open
            >
                <ul className="space-y-1.5">
                    {items.map((item, index) => (
                        <li key={index}>
                            {item.subItems ? (
                                <div
                                    className="hs-accordion cursor-pointer"
                                    id={`accordion-${index}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (UNSAVED_CHANGES_TO_SCHOOL) {
                                                schoolStore.setIsVerifyUnsavedChangesDialogOpen(
                                                    true
                                                );
                                                schoolStore.setPendingOnClick(
                                                    () => {
                                                        item.onClick?.();
                                                        toggleDropdown();
                                                    }
                                                );
                                            } else {
                                                schoolStore.setIsVerifyUnsavedChangesDialogOpen(
                                                    false
                                                );
                                                item.onClick?.();
                                                toggleDropdown();
                                            }
                                        }}
                                        className={`hs-accordion-toggle w-full text-start flex items-center ${
                                            isMinimized && !isHovered
                                                ? "justify-center"
                                                : "justify-start"
                                        } gap-x-3.5 py-2 px-2.5 text-sm rounded-lg hover:bg-gray-100 ${
                                            item.isActive
                                                ? "bg-slate-100 text-slate-900 font-semibold shadow-md"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {item.icon}
                                        {(isHovered || !isMinimized) &&
                                            item.label}
                                        {!isMinimized && (
                                            <ChevronRight
                                                className={`size-4 ml-auto transform transition-transform ${
                                                    isDropdownOpen
                                                        ? "rotate-90"
                                                        : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    <div
                                        id={`accordion-${index}`}
                                        className={`hs-accordion-content w-full overflow-hidden transition-[height] duration-300 ${
                                            isDropdownOpen ? "block" : "hidden"
                                        }`}
                                    >
                                        <ul
                                            className={`hs-accordion-group ${
                                                (!isMinimized || isHovered) &&
                                                "ps-3"
                                            } pt-2 space-y-1 pb-2`}
                                        >
                                            {item.subItems.map(
                                                (subItem, subIndex) => (
                                                    <li
                                                        key={subIndex}
                                                        className="hs-accordion"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                subItem.onClick
                                                            }
                                                            className={`hs-accordion-toggle w-full text-start flex items-center ${
                                                                isMinimized &&
                                                                !isHovered
                                                                    ? "justify-center"
                                                                    : "justify-start"
                                                            } gap-x-3.5 py-2 px-2.5 text-sm rounded-lg hover:bg-gray-100 ${
                                                                subItem.isActive
                                                                    ? "bg-slate-100 text-slate-900 font-semibold shadow-md"
                                                                    : "text-gray-700"
                                                            }`}
                                                        >
                                                            {subItem.icon}
                                                            {(isHovered ||
                                                                !isMinimized) &&
                                                                subItem.label}
                                                        </button>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <a
                                    onClick={() => {
                                        if (UNSAVED_CHANGES_TO_SCHOOL) {
                                            schoolStore.setIsVerifyUnsavedChangesDialogOpen(
                                                true
                                            );
                                            schoolStore.setPendingOnClick(() =>
                                                item.onClick()
                                            );
                                        } else {
                                            schoolStore.resetAll();
                                            item.onClick();
                                        }
                                    }}
                                    className={`flex cursor-pointer items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg hover:bg-gray-100 ${
                                        item.isActive
                                            ? "bg-slate-100 text-slate-900 font-semibold shadow-md"
                                            : "text-gray-700"
                                    }`}
                                >
                                    {item.icon}
                                    {(isHovered || !isMinimized) && item.label}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </CustomDiv>
        </div>
    );
};

export default observer(Sidebar);
