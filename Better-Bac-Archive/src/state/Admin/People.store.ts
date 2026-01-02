import { ICourse, IUser } from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class PeopleStore {
    constructor() {
        makeAutoObservable(this);
    }

    schoolMembers: IUser[] | null = [];

    setSchoolMembers(newMembers: IUser[]) {
        this.schoolMembers = newMembers;
    }

    loading: boolean = true;

    setLoading(loading: boolean) {
        this.loading = loading;
    }

    error: string | null = null;

    setError(error: string) {
        this.error = error;
    }

    expandedUser: IUser | null = null;

    setExpandedUser(user: IUser) {
        this.expandedUser = user;
    }

    isNewUserDialogOpen: boolean = false;

    setIsNewUserDialogOpen(isOpen: boolean) {
        this.isNewUserDialogOpen = isOpen;
    }

    manageUserCoursesView: boolean = false;

    setManageUserCoursesView(manage: boolean) {
        this.manageUserCoursesView = manage;
    }

    expandedUserCourses: ICourse[] | null = null;

    setExpandedUserCourses(courses: ICourse[]) {
        this.expandedUserCourses = courses;
    }

    userEditMode: boolean = false;

    setUserEditMode(editMode: boolean) {
        this.userEditMode = editMode;
    }
}

const StoreContext = React.createContext<PeopleStore>(new PeopleStore());

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const usePeopleStore = (): PeopleStore => React.useContext(StoreContext);
