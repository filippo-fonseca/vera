import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@BetterBac/components/common/Dialog";
import AddUsersTemplate from "@BetterBac/components/common/AddUsersTemplate";
import { useSchoolStore } from "@BetterBac/state/Admin/School.store";
import { observer } from "mobx-react";
import React from "react";
import {
    getFirestore,
    collection,
    query,
    onSnapshot,
    updateDoc,
    doc,
} from "firebase/firestore";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { IUser } from "@BetterBac/lib/GlobalTypes";

const ManageSchoolAdminsDialog = () => {
    const generalStore = useGeneralStore();
    const schoolStore = useSchoolStore();
    const [poolToAdd, setPoolToAdd] = useState<IUser[]>([]);
    const [selectedEducators, setSelectedEducators] = useState<IUser[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredPoolToAdd, setFilteredPoolToAdd] = useState<IUser[]>([]);

    useEffect(() => {
        const adminUserIds = generalStore.userSchool?.adminAccessUserIds || [];
        const nonAdminEducators = generalStore.userSchoolAllUsers.filter(
            user => user.isEducator && !adminUserIds.includes(user.id)
        );

        setPoolToAdd(nonAdminEducators);
    }, [generalStore.userSchool?.adminAccessUserIds]);

    useEffect(() => {
        // Filter poolToAdd based on searchQuery
        const filteredUsers = poolToAdd.filter(user =>
            user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredPoolToAdd(filteredUsers);
    }, [searchQuery, poolToAdd]);

    const handleSave = async () => {
        const db = getFirestore();
        const schoolRef = doc(db, "schools", generalStore.userSchool?.id || "");

        try {
            // Add selected user IDs to adminAccessUserIds array
            await updateDoc(schoolRef, {
                adminAccessUserIds: [
                    ...(generalStore.userSchool?.adminAccessUserIds || []),
                    ...selectedEducators.map(user => user.id),
                ],
            }).then(() => {
                // Close the dialog and clear selected educators
                schoolStore.setIsManageSchoolAdminsDialogOpen(false);
                generalStore.setUserSchool({
                    ...generalStore.userSchool,
                    adminAccessUserIds: [
                        ...(generalStore.userSchool?.adminAccessUserIds || []),
                        ...selectedEducators.map(user => user.id),
                    ],
                });
                setSelectedEducators([]);
            });
        } catch (error) {
            console.error("Error updating school admins: ", error);
        }
    };

    const handleClear = () => {
        // Clear selected educators
        setSelectedEducators([]);
    };

    return (
        <Dialog
            open={schoolStore.isManageSchoolAdminsDialogOpen}
            onOpenChange={() => {
                if (schoolStore.isManageSchoolAdminsDialogOpen) {
                    schoolStore.setIsManageSchoolAdminsDialogOpen(false);
                }
            }}
        >
            <DialogContent className="bg-white">
                <AddUsersTemplate
                    title={`Add an admin`}
                    desc={`Click on an educator to grant them admin access on ${generalStore.userSchool?.name}'s BetterBac organization.`}
                    queryValue={searchQuery}
                    queryOnChangeHandler={e => setSearchQuery(e.target.value)}
                    queryInputPlaceholder={`Search educators at ${generalStore.userSchool?.name}`}
                    poolToAdd={filteredPoolToAdd}
                    selectedStudents={selectedEducators}
                    setSelectedStudents={setSelectedEducators}
                    handleSave={handleSave}
                    handleClear={handleClear}
                />
            </DialogContent>
        </Dialog>
    );
};

export default observer(ManageSchoolAdminsDialog);
