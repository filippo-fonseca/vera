import { SchoolDashboardState } from "@BetterBac/components/common/SubNavbar/SubNavbar";
import {
    ActiveCourseDashboardState,
    IAssignment,
    IAssignmentInstance,
    ICourse,
    ISchool,
    IUser,
    Tabs,
} from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class GeneralStore {
    constructor() {
        makeAutoObservable(this);
    }

    userSchool: ISchool | null = null;

    setUserSchool(newSchool: ISchool) {
        this.userSchool = newSchool;
    }

    userSchoolAllUsers: IUser[] | null = null;

    setUserSchoolAllUsers(newUser: IUser[]) {
        this.userSchoolAllUsers = newUser;
    }

    activeSchoolDashboardState: SchoolDashboardState =
        SchoolDashboardState.HOME;

    setActiveSchoolDashboardState(newState: SchoolDashboardState) {
        this.activeSchoolDashboardState = newState;
    }

    userCourses: ICourse[] | null = null;

    setUserCourses(newCourses: ICourse[]) {
        this.userCourses = newCourses;
    }

    currentTab: Tabs = null;

    setCurrentTab(newTab: Tabs) {
        this.currentTab = newTab;
    }

    activeCourse: ICourse | null = null;

    setActiveCourse(newCourse: ICourse) {
        this.activeCourse = newCourse;
    }

    activeCourseAssignments: IAssignment[] | null = null;

    setActiveCourseAssignments(newAssignments: IAssignment[]) {
        this.activeCourseAssignments = newAssignments;
    }

    activeCourseAssignmentInstances: IAssignmentInstance[] | null = null;

    setActiveCourseAssignmentInstances(newInstances: IAssignmentInstance[]) {
        this.activeCourseAssignmentInstances = newInstances;
    }

    addActiveCourseAssignmentInstance(newInstance: IAssignmentInstance) {
        if (this.activeCourseAssignmentInstances === null) {
            this.activeCourseAssignmentInstances = [newInstance];
        } else {
            this.activeCourseAssignmentInstances.push(newInstance);
        }
    }

    allAssignments: IAssignment[] | null = null;

    setAllAssignments(newAssignments: IAssignment[]) {
        this.allAssignments = newAssignments;
    }

    activeCourseDashboardState: ActiveCourseDashboardState =
        ActiveCourseDashboardState.HOME;

    setActiveCourseDashboardState(newState: ActiveCourseDashboardState) {
        this.activeCourseDashboardState = newState;
    }

    expandedAssignment: IAssignment | null = null;

    setExpandedAssignment(newAssignment: IAssignment) {
        this.expandedAssignment = newAssignment;
    }

    isToastVisible = false;

    setIsToastVisible(isVisible: boolean) {
        this.isToastVisible = isVisible;
    }

    toastText: string | null = null;

    setToastText(newText: string) {
        this.toastText = newText;
    }

    isSuccessToast = false;

    setIsSuccessToast(isSuccess: boolean) {
        this.isSuccessToast = isSuccess;
    }
}

const StoreContext = React.createContext<GeneralStore>(new GeneralStore());

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const useGeneralStore = (): GeneralStore =>
    React.useContext(StoreContext);
