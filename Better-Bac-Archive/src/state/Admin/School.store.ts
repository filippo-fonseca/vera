import { ICourse, ISchool, IUser } from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class SchoolStore {
    constructor() {
        makeAutoObservable(this);
    }

    localSchoolInstance: ISchool | null = null;

    setLocalSchoolInstance(school: ISchool | null) {
        this.localSchoolInstance = school;
    }

    isVerifyUnsavedChangesDialogOpen: boolean = false;

    setIsVerifyUnsavedChangesDialogOpen(isOpen: boolean) {
        this.isVerifyUnsavedChangesDialogOpen = isOpen;
    }

    pendingOnClick: () => void = () => {};

    setPendingOnClick(onClick: () => void) {
        this.pendingOnClick = onClick;
    }

    resetAll() {
        this.isVerifyUnsavedChangesDialogOpen = false;
        this.pendingOnClick = () => {};
    }

    isManageSchoolAdminsDialogOpen: boolean = false;

    setIsManageSchoolAdminsDialogOpen(isOpen: boolean) {
        this.isManageSchoolAdminsDialogOpen = isOpen;
    }

    adminUsers: IUser[] = [];

    setAdminUsers(users: IUser[]) {
        this.adminUsers = users;
    }
}

const StoreContext = React.createContext<SchoolStore>(new SchoolStore());

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const useSchoolStore = (): SchoolStore => React.useContext(StoreContext);
