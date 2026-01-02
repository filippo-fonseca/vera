import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import {
    Dialog,
    DialogContent,
    DialogFooter,
} from "@BetterBac/components/common/Dialog";
import { usePeopleStore } from "@BetterBac/state/Admin/People.store";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { IInvitee, IUser } from "@BetterBac/lib/GlobalTypes";
import { db } from "../../../../../../config/firebase";
import { Heart } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const NewUserDialog = () => {
    const peopleStore = usePeopleStore();
    const generalStore = useGeneralStore();
    const [email, setEmail] = useState("");
    const [isEducator, setIsEducator] = useState(false);

    const handleCreateUser = async () => {
        if (!email) {
            generalStore.setIsToastVisible(true);
            generalStore.setToastText(
                "Please ensure you have filled out all fields."
            );
            setTimeout(() => {
                generalStore.setIsToastVisible(false);
                generalStore.setToastText(null);
            }, 2500);
            return;
        }

        // Extract the domain from the email
        const emailDomain = email.split("@")[1];
        const schoolDomain = generalStore.userSchool?.domain;

        if (emailDomain !== schoolDomain) {
            generalStore.setIsToastVisible(true);
            generalStore.setToastText(
                "For security purposes, make sure the new user's email is a valid address from your own school!"
            );
            setTimeout(() => {
                generalStore.setIsToastVisible(false);
                generalStore.setToastText(null);
            }, 4000);
            return;
        } else {
            try {
                // Create user with Firebase Auth
                const inviteeElemId = uuidv4();
                const invitee: IInvitee = {
                    id: inviteeElemId,
                    email,
                    linkedSchoolId: generalStore.userSchool?.id!,
                    isEducator: isEducator,
                };

                // Save user in Firestore
                await setDoc(doc(db, "invitees", inviteeElemId), invitee).then(
                    () => {
                        peopleStore.setIsNewUserDialogOpen(false);
                        setEmail("");
                        generalStore.setIsToastVisible(true);
                        generalStore.setIsSuccessToast(true);
                        generalStore.setToastText(
                            "Success! Tell the new user to check their email for their invite to your school's BetterBac org."
                        );
                        setTimeout(() => {
                            generalStore.setIsToastVisible(false);
                            generalStore.setToastText(null);
                            //allows for the success toast to hide and prevents the error icon from temporarily showing. Should probably clean up.
                            setTimeout(() => {
                                generalStore.setIsSuccessToast(false);
                            }, 1000);
                        }, 2500);
                    }
                );

                // Close dialog and clear fields
            } catch (error) {
                console.error("Error creating invitee:", error);
                generalStore.setIsToastVisible(true);
                generalStore.setToastText(
                    "Something went wrong adding the new user. Please try again."
                );
                setTimeout(() => {
                    generalStore.setIsToastVisible(false);
                    generalStore.setToastText(null);
                }, 4000);
                peopleStore.setIsNewUserDialogOpen(false);
                setEmail("");
            }
        }
    };

    return (
        <Dialog
            open={peopleStore.isNewUserDialogOpen}
            onOpenChange={() => {
                peopleStore.setIsNewUserDialogOpen(
                    !peopleStore.isNewUserDialogOpen
                );
            }}
        >
            <DialogContent className="min-w-[650px] bg-white">
                <CustomDiv className="flex flex-col gap-3">
                    <CustomDiv className="flex items-center justify-center p-2 border shadow-md w-max rounded-xl">
                        <Heart size={36} />
                    </CustomDiv>
                    <CustomDiv>
                        <CustomText className="text-xl font-semibold">
                            Add someone to the {generalStore.userSchool?.name}{" "}
                            community.
                        </CustomText>
                        <CustomText className="text-sm text-gray-600">
                            Whether it's a student, teacher, or admin, they
                            belong here.
                        </CustomText>
                    </CustomDiv>
                </CustomDiv>
                <div className="w-full mt-2">
                    <label className="block mb-2 text-sm font-medium">
                        <CustomText>
                            What is their school email address?
                        </CustomText>
                    </label>
                    <CustomTextInput
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={`amazingperson@${generalStore.userSchool?.domain}`}
                    />
                </div>
                <div className="w-full mt-4 flex items-center">
                    <input
                        type="checkbox"
                        id="isEducator"
                        checked={isEducator}
                        onChange={() => setIsEducator(prev => !prev)}
                        className="mr-2"
                    />
                    <label htmlFor="isEducator" className="text-sm font-medium">
                        <CustomText>Is this person an educator?</CustomText>
                    </label>
                </div>
                <DialogFooter>
                    <CustomButton onClick={handleCreateUser}>
                        Invite
                    </CustomButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default observer(NewUserDialog);
