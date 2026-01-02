import { IUser, IYearBatch } from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class YearBatchesStore {
    constructor() {
        makeAutoObservable(this);
    }

    yearBatchesForSchool: IYearBatch[] | null = [];

    setYearBatchesForSchool(newYearBatches: IYearBatch[]) {
        this.yearBatchesForSchool = newYearBatches;
    }

    loading: boolean = true;

    setLoading(loading: boolean) {
        this.loading = loading;
    }

    error: string | null = null;

    setError(error: string) {
        this.error = error;
    }

    isCreateNewYearBatchDialogOpen: boolean = false;

    setIsCreateNewYearBatchDialogOpen(isOpen: boolean) {
        this.isCreateNewYearBatchDialogOpen = isOpen;
    }

    currentYearBatch: IYearBatch | null = null;

    setCurrentYearBatch(yearBatch: IYearBatch) {
        this.currentYearBatch = yearBatch;
    }

    isYearBatchDialogOpen: boolean = false;

    setIsYearBatchDialogOpen(isOpen: boolean) {
        this.isYearBatchDialogOpen = isOpen;
    }
}

const StoreContext = React.createContext<YearBatchesStore>(
    new YearBatchesStore()
);

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const useYearBatchesStore = (): YearBatchesStore =>
    React.useContext(StoreContext);
