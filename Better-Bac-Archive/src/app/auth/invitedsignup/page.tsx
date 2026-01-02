"use client";

import React from "react";
import OrbitingLoader from "@BetterBac/components/common/OrbitingLoader";
import { useRouter, useSearchParams } from "next/navigation";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useInvitedUserStore } from "@BetterBac/state/InvitedUser.store";
import Toast from "@BetterBac/components/common/Toast";
import Particles from "@BetterBac/components/common/Particles/Particles";
import { observer } from "mobx-react";
import { db, auth } from "../../../../config/firebase";
import { IUser, IInvitee } from "@BetterBac/lib/GlobalTypes";
import InvitedUserFormTemplate from "@BetterBac/components/auth/AuthFormTemplate/InvitedUserFormTemplate";
import CustomText from "@BetterBac/components/common/CustomText";

const InvitedUserSignup = () => {
    const invitedUserStore = useInvitedUserStore();
    const router = useRouter();
    const searchParams = useSearchParams(); // Use the hook to access URL parameters

    // Extract the email parameter from the URL
    const emailFromUrl = searchParams.get("email") || null;

    const displayName = invitedUserStore.tempDisplayName;
    const password = invitedUserStore.tempPassword;

    const disabled =
        displayName == "" ||
        password == "" ||
        displayName == null ||
        password == null ||
        password?.length < 6;

    // Function to delete the invitee document after successful account creation
    const deleteInviteeDocument = async () => {
        if (emailFromUrl) {
            const inviteesRef = collection(db, "invitees");
            const q = query(inviteesRef, where("email", "==", emailFromUrl));
            const querySnapshot = await getDocs(q); // Use getDocs to fetch the documents
            if (!querySnapshot.empty) {
                const docSnapshot = querySnapshot.docs[0];
                await deleteDoc(doc(db, "invitees", docSnapshot.id));
            }
        }
    };

    const handleLogin = async () => {
        if (disabled) return;

        invitedUserStore.setLoading(true);

        try {
            if (!emailFromUrl) {
                throw new Error("No email provided");
            }

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                emailFromUrl,
                password
            );
            const user = userCredential.user;

            // Create user document in Firestore
            const userDoc: IUser = {
                id: user.uid,
                displayName: displayName,
                email: emailFromUrl,
                isEducator:
                    invitedUserStore.inviteeInstance?.isEducator || false,
                linkedSchoolId:
                    invitedUserStore.inviteeInstance?.linkedSchoolId || "",
            };

            await setDoc(doc(db, "users", user.uid), userDoc).then(async () => {
                await deleteInviteeDocument();
                router.push("/");
            });
        } catch (error) {
            console.error("Error during sign-up:", error);
            invitedUserStore.setIsErr(true);
            invitedUserStore.setErrorMsg(
                "Failed to create account. Please try again."
            );
        } finally {
            invitedUserStore.setLoading(false);
        }
    };

    React.useEffect(() => {
        // Set loading to true when starting to fetch data
        invitedUserStore.setLoading(true);

        if (emailFromUrl) {
            // Create a query to find documents with the matching email
            const inviteesRef = collection(db, "invitees");
            const q = query(inviteesRef, where("email", "==", emailFromUrl));

            // Set up a real-time listener
            const unsubscribe = onSnapshot(
                q,
                querySnapshot => {
                    if (!querySnapshot.empty) {
                        // Assuming there's only one document with this email
                        const docSnapshot = querySnapshot.docs[0];
                        const data = docSnapshot.data() as IInvitee;
                        invitedUserStore.setInviteeInstance(data);
                    } else {
                        invitedUserStore.setInviteeInstance(null);
                    }
                    invitedUserStore.setLoading(false); // Set loading to false once data is fetched
                },
                error => {
                    console.error("Error fetching invitee:", error);
                    invitedUserStore.setIsErr(true);
                    invitedUserStore.setLoading(false);
                }
            );

            // Clean up the listener on component unmount
            return () => unsubscribe();
        } else {
            invitedUserStore.setInviteeInstance(null);
            invitedUserStore.setLoading(false); // Set loading to false if email is not provided
        }
    }, [emailFromUrl, invitedUserStore]);

    if (invitedUserStore.loading) {
        return <OrbitingLoader />;
    }

    return (
        <>
            <Toast
                isVisible={invitedUserStore.isErr}
                text={invitedUserStore.errorMsg}
            />
            <Particles
                className="absolute inset-0"
                quantity={2000}
                ease={80}
                color={"#00000040"}
                refresh
            />
            {invitedUserStore.inviteeInstance ? (
                <InvitedUserFormTemplate
                    disabled={disabled}
                    isStudentLogin={
                        !invitedUserStore.inviteeInstance?.isEducator
                    }
                    handleLogin={handleLogin}
                    email={emailFromUrl}
                />
            ) : (
                <CustomText className="font-medium">
                    Sorry, your email{" "}
                    {emailFromUrl ? `(${emailFromUrl})` : null} does not
                    currently have a valid invite to join this school's
                    BetterBac org.
                </CustomText>
            )}
        </>
    );
};

export default observer(InvitedUserSignup);
