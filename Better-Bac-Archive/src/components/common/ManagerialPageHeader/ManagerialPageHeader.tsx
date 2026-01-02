import { Calendar } from "lucide-react";
import React from "react";
import CustomDiv from "../CustomDiv";
import CustomIconWrapper from "../CustomIconWrapper";
import CustomRoundedButton from "../CustomRoundedButton";
import CustomText from "../CustomText";
import { ICustomRoundedButton } from "../CustomRoundedButton/CustomRoundedButton";
import { observer } from "mobx-react";

interface IManagerialPageHeader {
    icon: React.ReactNode;
    title: string;
    description: string;
    roundedButtonProps: ICustomRoundedButton;
}

const ManagerialPageHeader = (props: IManagerialPageHeader) => {
    return (
        <CustomDiv className="flex items-start justify-between">
            <CustomDiv>
                <CustomDiv className="flex items-center gap-2">
                    <CustomIconWrapper>{props.icon}</CustomIconWrapper>
                    <CustomText className="text-xl font-semibold">
                        {props.title}
                    </CustomText>
                </CustomDiv>
                <CustomText className="text-sm text-gray-600">
                    {props.description}
                </CustomText>
            </CustomDiv>
            <CustomRoundedButton {...props.roundedButtonProps} />
        </CustomDiv>
    );
};

export default observer(ManagerialPageHeader);
