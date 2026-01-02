import { IUser } from "@BetterBac/lib/GlobalTypes";
import { makeAutoObservable } from "mobx";
import React from "react";

/**
 * A store to handle anything signup-related.
 */
export default class AuthStore {
    constructor() {
        makeAutoObservable(this);
    }

    user: IUser | null = null;

    setUser(newUser: IUser) {
        this.user = newUser;
    }

    globalLoading: boolean = true;

    setGlobalLoading(loading: boolean) {
        this.globalLoading = loading;
    }

    tempAuthEmail: string = null;

    setTempAuthEmail(email: string) {
        this.tempAuthEmail = email;
    }

    tempAuthPassword: string = null;

    setTempAuthPassword(password: string) {
        this.tempAuthPassword = password;
    }

    showErrorToast: boolean = false;

    setShowErrorToast(show: boolean) {
        this.showErrorToast = show;
    }

    errMsg: string = "";

    setErrMsg(err: string) {
        this.errMsg = err;
    }
}

const StoreContext = React.createContext<AuthStore>(new AuthStore());

/**
 * Hook to use store.
 *
 * @see Reference:
 *      https://dev.to/codingislove/how-to-setup-mobx-with-react-context-49jh
 */
export const useAuthStore = (): AuthStore => React.useContext(StoreContext);
