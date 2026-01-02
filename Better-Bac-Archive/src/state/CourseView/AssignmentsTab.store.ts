import { AssignmentsTabState } from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class AssignmentsTabStore {
    constructor() {
        makeAutoObservable(this);
    }

    assignmentsTabState: AssignmentsTabState =
        AssignmentsTabState.CALENDAR_VIEW;

    setAssignmentsTabState(newState: AssignmentsTabState) {
        this.assignmentsTabState = newState;
    }
}

const StoreContext = React.createContext<AssignmentsTabStore>(
    new AssignmentsTabStore()
);

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const useAssignmentsTabStore = (): AssignmentsTabStore =>
    React.useContext(StoreContext);
