import { GradesTabState } from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class GradesTabStore {
    constructor() {
        makeAutoObservable(this);
    }

    gradesTabState: GradesTabState = GradesTabState.TREND;

    setGradesTabState(newState: GradesTabState) {
        this.gradesTabState = newState;
    }
}

const StoreContext = React.createContext<GradesTabStore>(new GradesTabStore());

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const useGradesTabStore = (): GradesTabStore =>
    React.useContext(StoreContext);
