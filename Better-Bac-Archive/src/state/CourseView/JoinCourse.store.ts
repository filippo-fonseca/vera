import { GradesTabState } from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class JoinCourseStore {
    constructor() {
        makeAutoObservable(this);
    }

    isJoinCourseDialogOpen: boolean = false;

    setIsJoinCourseDialogOpen(isOpen: boolean) {
        this.isJoinCourseDialogOpen = isOpen;
    }

    tempCode: string = "";

    setTempCode(code: string) {
        this.tempCode = code;
    }
}

const StoreContext = React.createContext<JoinCourseStore>(
    new JoinCourseStore()
);

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const useJoinCourseStore = (): JoinCourseStore =>
    React.useContext(StoreContext);
