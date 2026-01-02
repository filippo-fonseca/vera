"use client";

import OrbitingLoader from "@BetterBac/components/common/OrbitingLoader";
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { auth } from "../../../../config/firebase";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import { useRouter } from "next/navigation";
import { validateEmail } from "@BetterBac/lib/utils";
import Particles from "@BetterBac/components/common/Particles/Particles";
import AuthFormTemplate from "@BetterBac/components/auth/AuthFormTemplate/AuthFormTemplate";
import { observer } from "mobx-react";
import Toast from "@BetterBac/components/common/Toast";
import { parseFirebaseAuthError } from "@BetterBac/lib/extraUtils/parseFirebaseAuthError.util";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../config/firebase"; // Import Firestore database configuration

const EducatorAuth: React.FC = () => {
    const authStore = useAuthStore();
    const router = useRouter();

    const disabled =
        authStore.tempAuthEmail == "" ||
        authStore.tempAuthPassword == "" ||
        authStore.tempAuthEmail == null ||
        authStore.tempAuthPassword == null ||
        !validateEmail(authStore.tempAuthEmail) ||
        authStore.tempAuthPassword?.length < 6;

    const handleEducatorLogin = async (e: any) => {
        authStore.setGlobalLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                authStore.tempAuthEmail,
                authStore.tempAuthPassword
            );

            // Fetch user data from the "users" collection
            const userId = userCredential.user.uid;
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData?.isEducator) {
                    // If the user is an educator, proceed to the "/" route
                    router.push("/");
                } else {
                    // If not an educator, show an error message
                    authStore.setGlobalLoading(false);
                    authStore.setShowErrorToast(true);
                    authStore.setErrMsg(
                        "Sorry, you're not registered as an educator in our records. If you're a student, click below."
                    );
                }
            } else {
                // Handle the case where the user document does not exist
                authStore.setGlobalLoading(false);
                authStore.setShowErrorToast(true);
                authStore.setErrMsg(
                    "User not found. Please check your credentials."
                );
            }
        } catch (err) {
            authStore.setGlobalLoading(false);
            authStore.setShowErrorToast(true);
            console.log("code" + err.code);
            authStore.setErrMsg(parseFirebaseAuthError(err));
        } finally {
            authStore.setTempAuthEmail(null);
            authStore.setTempAuthPassword(null);
        }
    };

    React.useEffect(() => {
        authStore.setGlobalLoading(false);
    }, []);

    React.useEffect(() => {
        if (authStore.showErrorToast) {
            setTimeout(() => {
                authStore.setShowErrorToast(false);
            }, 4000);
        }
    }, [authStore.showErrorToast]);

    if (authStore.globalLoading) {
        return <OrbitingLoader />;
    }
    return (
        <>
            <Toast
                isVisible={authStore.showErrorToast}
                text={authStore.errMsg}
            />
            <Particles
                className="absolute inset-0"
                quantity={2000}
                ease={80}
                color={"#00000040"}
                refresh
            />
            <AuthFormTemplate
                handleLogin={handleEducatorLogin}
                disabled={disabled}
            />
        </>
    );
};

export default observer(EducatorAuth);
