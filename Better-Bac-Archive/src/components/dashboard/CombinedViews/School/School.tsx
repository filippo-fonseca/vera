import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useGeneralStore } from "@BetterBac/state/General.store";
import AvatarCircles from "@BetterBac/components/common/AvatarCircles/AvatarCircles";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import DotPattern from "@BetterBac/components/common/DotPattern/DotPattern";
import { getIBDPYear } from "@BetterBac/lib/extraUtils/getIBDPYear.util";
import CleoBlurb from "../CourseView/PrimaryWidget/CleoBlurb";
import Pfp from "@BetterBac/components/common/Pfp/Pfp";
import { getDocs, collection, query, where } from "firebase/firestore";
import { IUser, Tabs } from "@BetterBac/lib/GlobalTypes";
import { db } from "../../../../../config/firebase";
import SubNavbar, {
    SchoolDashboardState,
} from "../../../common/SubNavbar/SubNavbar";
import SchoolProfile from "./SchoolProfile";
import SchoolHome from "./SchoolHome";
import SchoolSettings from "./SchoolSettings";
import { Dialog, DialogContent } from "@BetterBac/components/common/Dialog";
import { useSchoolStore } from "@BetterBac/state/Admin/School.store";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import SchoolAdmins from "./SchoolAdmins";
import VerifyUnsavedSchoolChangesDialog from "./VerifyUnsavedSchoolChangesDialog";

const School = () => {
    const schoolStore = useSchoolStore();
    const generalStore = useGeneralStore();
    const [randomUsers, setRandomUsers] = useState<IUser[]>([]);

    useEffect(() => {
        // Randomly select 5 users
        const shuffled = generalStore.userSchoolAllUsers.sort(
            () => 0.5 - Math.random()
        );
        setRandomUsers(shuffled.slice(0, 5));
    }, [generalStore.userSchool?.id]);

    const schoolTabRenderer = () => {
        switch (generalStore.activeSchoolDashboardState) {
            case SchoolDashboardState.HOME:
                return <SchoolHome />;
            case SchoolDashboardState.PROFILE:
                return <SchoolProfile />;
            case SchoolDashboardState.SETTINGS:
                return <SchoolSettings />;
            case SchoolDashboardState.ADMINS:
                return <SchoolAdmins />;
        }
    };

    return (
        <>
            <VerifyUnsavedSchoolChangesDialog />
            <div className={`flex flex-col flex-1 h-full`}>
                {/* Top half-height widget */}
                <div className="ml-3 mb-3 px-6 py-4 bg-white border rounded-xl relative overflow-clip shadow-md flex-0.5 min-h-[325px] flex flex-col justify-between">
                    <DotPattern className="absolute inset-0 z-0" />
                    <div className="relative z-10">
                        <SubNavbar isSchool />
                    </div>
                    <div className="relative flex flex-col items-center gap-4 mt-4">
                        <Pfp isSchool size="size-20" />
                        <div className="text-center flex flex-col gap-1">
                            <CustomText className="text-2xl font-bold">
                                {generalStore.userSchool?.name}
                            </CustomText>
                            <CustomText className="text-gray-600">
                                {generalStore.userSchool?.addressObj.city},{" "}
                                {
                                    generalStore.userSchool?.addressObj
                                        .stateProvince
                                }
                                , {generalStore.userSchool?.addressObj.country}
                            </CustomText>
                        </div>
                    </div>
                    <div className="relative w-full flex items-center justify-between mt-4">
                        <CleoBlurb />
                        <AvatarCircles
                            numPeople={generalStore.userSchoolAllUsers.length} // Total number of users
                            users={randomUsers} // 5 random users
                            onClick={() =>
                                generalStore.setCurrentTab(Tabs.PEOPLE)
                            }
                        />
                    </div>
                </div>{" "}
                <div
                    className={`flex-1 h-full ml-3 overflow-hidden flex items-center flex-col p-6 bg-white border rounded-xl shadow-md`}
                >
                    {schoolTabRenderer()}
                </div>
            </div>
        </>
    );
};

export default observer(School);
