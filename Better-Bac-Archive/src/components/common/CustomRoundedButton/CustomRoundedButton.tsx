import { Plus } from "lucide-react";
import { observer } from "mobx-react";
import React from "react";
import CustomButton from "../CustomButton/CustomButton";

export interface ICustomRoundedButton {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    customIconSize?: number;
    customButtonSizeString?: string;
    customIcon?: React.ReactNode;
    disabled?: boolean;
}

const CustomRoundedButton = (props: ICustomRoundedButton) => {
    return (
        <CustomButton
            onClick={props.onClick}
            className={`${
                props.disabled && "cursor-not-allowed opacity-20"
            } z-20 bg-gray-200 ${
                props.customButtonSizeString ?? "size-7"
            } hover:opacity-50 flex items-center justify-center rounded-full shadow-md focus:outline-none transition-transform transform hover:scale-[1.09]`}
            disabled={props.disabled}
        >
            {props.customIcon ?? <Plus size={props.customIconSize ?? 12} />}
        </CustomButton>
    );
};

export default observer(CustomRoundedButton);
