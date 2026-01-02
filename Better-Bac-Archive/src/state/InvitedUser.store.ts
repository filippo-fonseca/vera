import { IInvitee, IUser } from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class InvitedUserStore {
    constructor() {
        makeAutoObservable(this);
    }

    inviteeInstance: IInvitee | null = null;

    setInviteeInstance(invitee: IInvitee) {
        this.inviteeInstance = invitee;
    }

    loading: boolean = true;

    setLoading(loading: boolean) {
        this.loading = loading;
    }

    isErr = false;

    setIsErr(error: boolean) {
        this.isErr = error;
    }

    errorMsg: string | null = null;

    setErrorMsg(error: string) {
        this.errorMsg = error;
    }

    tempDisplayName: string = "";

    setTempDisplayName(name: string) {
        this.tempDisplayName = name;
    }

    tempPassword: string = "";

    setTempPassword(password: string) {
        this.tempPassword = password;
    }
}

const StoreContext = React.createContext<InvitedUserStore>(
    new InvitedUserStore()
);

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const useInvitedUserStore = (): InvitedUserStore =>
    React.useContext(StoreContext);
