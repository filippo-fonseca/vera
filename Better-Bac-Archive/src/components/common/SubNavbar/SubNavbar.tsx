"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@BetterBac/components/common/NavigationMenu";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import { Menu, School } from "lucide-react";

export enum ActiveCourseDashboardState {
    HOME = "Home",
    ASSIGNMENTS = "Assignments",
    GRADES = "Grades",
    FILE_REPO = "File Repo",
    CLASS_DIRECTORY = "Class Directory",
    GRADE_BOUNDARIES = "Grade Boundaries",
}

export enum SchoolDashboardState {
    HOME = "Home",
    PROFILE = "Profile",
    SETTINGS = "Settings",
    ADMINS = "Admins",
    ASSIGNMENTS = "Assignments",
    OTHER = "Other",
}

interface ISubNavbar {
    isSchool?: boolean;
}

const SubNavbar = (props: ISubNavbar) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const generalStore = useGeneralStore();
    const menuRef = useRef<HTMLDivElement>(null);

    // Toggle menu visibility
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Close the menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Close menu after menu item click (small screen only)
    const handleCourseMenuItemClick = (value: ActiveCourseDashboardState) => {
        generalStore.setActiveCourseDashboardState(value);
        if (window.innerWidth < 1024) {
            // Assuming 1024px as breakpoint for large screens
            setIsMenuOpen(false);
        }
    };

    // Close menu after menu item click (small screen only)
    const handleSchoolCourseMenuItemClick = (value: SchoolDashboardState) => {
        generalStore.setActiveSchoolDashboardState(value);
        if (window.innerWidth < 1024) {
            // Assuming 1024px as breakpoint for large screens
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="relative">
            {/* Hamburger Button */}
            <button
                className="lg:hidden text-gray-900 bg-gray-200 size-7 flex items-center justify-center rounded-full hover:text-gray-900 hover:opacity-50"
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                <Menu size={12} />
            </button>

            {/* Navigation Menu for Large Screens */}
            <div className="hidden lg:block">
                <NavigationMenu>
                    <NavigationMenuList>
                        {Object.entries(
                            props.isSchool
                                ? SchoolDashboardState
                                : ActiveCourseDashboardState
                        ).map(([key, value]) => (
                            <NavigationMenuItem key={key}>
                                <NavigationMenuLink
                                    className={navigationMenuTriggerStyle()}
                                    isActive={
                                        props.isSchool
                                            ? generalStore.activeSchoolDashboardState ===
                                              value
                                            : generalStore.activeCourseDashboardState ===
                                              value
                                    }
                                    onClick={() =>
                                        props.isSchool
                                            ? handleSchoolCourseMenuItemClick(
                                                  value
                                              )
                                            : handleCourseMenuItemClick(value)
                                    }
                                >
                                    {value}
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* Navigation Menu for Small Screens */}
            <div
                ref={menuRef}
                className={`lg:hidden absolute z-50 top-full left-0 mt-1 rounded-xl max-h-[250px] overflow-scroll border w-fit py-2 px-6 bg-white shadow-lg transform transition-transform ${
                    isMenuOpen
                        ? "translate-y-0"
                        : "translate-y-[-5px] opacity-0"
                }`}
                style={{ transition: "transform 0.3s ease, opacity 0.3s ease" }}
            >
                <NavigationMenu>
                    <NavigationMenuList className="flex flex-col gap-2 ">
                        {Object.entries(
                            props.isSchool
                                ? SchoolDashboardState
                                : ActiveCourseDashboardState
                        ).map(([key, value]) => (
                            <NavigationMenuItem key={key}>
                                <NavigationMenuLink
                                    className={navigationMenuTriggerStyle()}
                                    isActive={
                                        props.isSchool
                                            ? generalStore.activeSchoolDashboardState ===
                                              value
                                            : generalStore.activeCourseDashboardState ===
                                              value
                                    }
                                    onClick={() =>
                                        props.isSchool
                                            ? handleSchoolCourseMenuItemClick(
                                                  value
                                              )
                                            : handleCourseMenuItemClick(value)
                                    }
                                >
                                    {value}
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    );
};

export default observer(SubNavbar);
