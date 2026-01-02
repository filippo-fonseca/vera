import { useEffect, useState } from "react";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";
import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { IUser } from "@BetterBac/lib/GlobalTypes";
import MemberDisplay from "@BetterBac/components/common/MemberDisplay";
import CustomRoundedButton from "@BetterBac/components/common/CustomRoundedButton";
import ManageSchoolAdminsDialog from "./ManageSchoolAdminsDialog";
import { useSchoolStore } from "@BetterBac/state/Admin/School.store";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import { Info, Trash } from "lucide-react";
import CustomAlertDialog from "@BetterBac/components/common/CustomAlertDialog";
import { db } from "../../../../../../config/firebase";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomTooltipWrapper from "@BetterBac/components/common/CustomTooltipWrapper";
import CustomText from "@BetterBac/components/common/CustomText";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import { outputFilteredUsersById } from "@BetterBac/lib/extraUtils/outputFilteredUsersById";

const SchoolAdmins = () => {
    const schoolStore = useSchoolStore();
    const generalStore = useGeneralStore();
    const authStore = useAuthStore();

    //removal state:
    const [stagedRemovalUser, setStagedRemovalUser] = useState<IUser | null>(
        null
    );

    useEffect(() => {
        const adminUserIds = generalStore.userSchool?.adminAccessUserIds || [];
        const adminUsers = outputFilteredUsersById({
            userArray: generalStore.userSchoolAllUsers,
            userIds: adminUserIds,
        });
        const sortedAdminUsers = adminUsers.sort((a, b) => {
            const lastNameA =
                a.displayName.split(" ").pop()?.toLowerCase() || "";
            const lastNameB =
                b.displayName.split(" ").pop()?.toLowerCase() || "";
            return lastNameA.localeCompare(lastNameB);
        });

        schoolStore.setAdminUsers(sortedAdminUsers);
    }, [generalStore.userSchool?.adminAccessUserIds]);

    const removeAdmin = async () => {
        if (!stagedRemovalUser) return;

        const schoolRef = doc(db, "schools", generalStore.userSchool?.id || "");

        try {
            // Get current adminAccessUserIds
            const schoolDoc = await getDoc(schoolRef);
            if (!schoolDoc.exists()) {
                console.error("School document does not exist.");
                return;
            }

            const adminUserIds = schoolDoc.data()?.adminAccessUserIds || [];

            // Remove the stagedRemovalUser's ID from adminAccessUserIds
            const updatedAdminUserIds = adminUserIds.filter(
                id => id !== stagedRemovalUser.id
            );

            // Update Firestore document with new adminAccessUserIds
            await updateDoc(schoolRef, {
                adminAccessUserIds: updatedAdminUserIds,
            });

            // Close the dialog and clear staged removal user
            schoolStore.setIsManageSchoolAdminsDialogOpen(false);
            setStagedRemovalUser(null);

            // Update generalStore.userSchool (if necessary)
            generalStore.setUserSchool({
                ...generalStore.userSchool,
                adminAccessUserIds: updatedAdminUserIds,
            });
        } catch (error) {
            console.error("Error removing admin: ", error);
        }
    };

    return (
        <>
            <ManageSchoolAdminsDialog />
            <CustomAlertDialog
                open={stagedRemovalUser !== null}
                title="Are you sure?"
                description="You are about to remove this educator's admin privileges on this BetterBac organization."
                onCancelClick={() => {
                    setStagedRemovalUser(null);
                }}
                onConfirmClick={() => removeAdmin()}
            />
            <div className="w-full overflow-hidden">
                {/* Header */}
                <div className="flex justify-between px-1">
                    <CustomDiv className="leading-[0.25rem] space-y-0.5 max-w-[800px]">
                        <h2 className="text-xl font-bold">
                            Manage School Admins
                        </h2>
                        <CustomText className="mb-2 text-sm text-gray-600">
                            As an admin yourself, you can determine which
                            educators have permission to handle{" "}
                            {generalStore.userSchool?.name + "'s"} users,
                            courses, settings, and other advanced
                            characteristics of this BetterBac organization.{" "}
                        </CustomText>
                    </CustomDiv>
                    <CustomRoundedButton
                        onClick={() =>
                            schoolStore.setIsManageSchoolAdminsDialogOpen(true)
                        }
                    />
                </div>
                <hr className="mt-6 mb-6" />
                <div className="flex flex-col flex-1 h-full overflow-y-scroll overflow-x-hidden p-1">
                    <CustomDiv className="space-y-4">
                        {schoolStore.adminUsers.length > 0 ? (
                            schoolStore.adminUsers.map(user => (
                                <MemberDisplay
                                    key={user.id}
                                    {...user}
                                    customRightComponent={
                                        user.id !== authStore.user.id && (
                                            <CustomButton
                                                className="flex items-center justify-center text-xs stroke-black hover:stroke-white font-semibold bg-white hover:bg-black hover:text-white active:scale-110 focus:outline-none border border-black focus:ring-4 focus:ring-gray-300 rounded-lg px-2 py-2 mb-2 transition-transform duration-150"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setStagedRemovalUser(user);
                                                }}
                                            >
                                                <Trash size={14} />
                                            </CustomButton>
                                        )
                                    }
                                />
                            ))
                        ) : (
                            <p>No admins found.</p>
                        )}
                    </CustomDiv>
                </div>
            </div>
        </>
    );
};

export default observer(SchoolAdmins);
