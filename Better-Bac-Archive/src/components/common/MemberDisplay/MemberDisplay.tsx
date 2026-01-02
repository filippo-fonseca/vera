import { IUser, Tabs } from "@BetterBac/lib/GlobalTypes";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import Link from "next/link";
import CustomButton from "../CustomButton/CustomButton";
import { Mail } from "lucide-react";
import { observer } from "mobx-react";
import Pfp from "../Pfp/Pfp";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import CustomDiv from "../CustomDiv";
import CustomText from "../CustomText";
import { usePeopleStore } from "@BetterBac/state/Admin/People.store";
import { useGeneralStore } from "@BetterBac/state/General.store";

interface IMemberDisplay extends IUser {
    generalOnClick?: () => void;
    customRightComponent?: React.ReactNode;
}

const MemberDisplay = (props: IMemberDisplay) => {
    const generalStore = useGeneralStore();
    const peopleStore = usePeopleStore();
    const authStore = useAuthStore();

    const isMe = props.id == authStore.user.id;

    return (
        <div
            key={props.id}
            className="flex items-center justify-between space-x-4 cursor-pointer transition-transform transform hover:scale-[1.01]"
            onClick={
                props.generalOnClick ??
                (() => {
                    if (
                        generalStore.userSchool?.adminAccessUserIds.includes(
                            authStore.user.id
                        )
                    ) {
                        generalStore.setCurrentTab(Tabs.PEOPLE);
                        peopleStore.setExpandedUser(props);
                    }
                })
            }
        >
            <div className="flex items-center space-x-4">
                <Pfp customUser={props} />
                <div>
                    <CustomDiv className="flex items-center space-x-2">
                        <p className="text-sm font-semibold leading-none">
                            {props.displayName}{" "}
                        </p>
                        {isMe && (
                            <CustomDiv className="flex items-center border shadow-md px-1 h-5 rounded-lg">
                                <CustomText className="text-[11px] font-semibold">
                                    You
                                </CustomText>
                            </CustomDiv>
                        )}
                    </CustomDiv>
                    <p className="text-sm text-gray-600 text-muted-foreground">
                        {props.email}
                    </p>
                </div>
            </div>
            {props.customRightComponent ?? (
                <Link href={`mailto:${props.email}`}>
                    <CustomButton className="flex items-center justify-center text-xs stroke-black hover:stroke-white font-semibold bg-white hover:bg-black hover:text-white active:scale-110 focus:outline-none border border-black focus:ring-4 focus:ring-gray-300 rounded-lg px-2 py-2 mb-2 transition-transform duration-150">
                        <Mail size={14} />
                    </CustomButton>
                </Link>
            )}
        </div>
    );
};

export default observer(MemberDisplay);
