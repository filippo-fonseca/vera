import React from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./AlertDialogComponents";
import CustomButton from "../CustomButton/CustomButton";
import CustomText from "../CustomText";
import { observer } from "mobx-react";

interface ICustomAlertDialog {
    open: boolean;
    onOpenChange?: () => void;
    title?: string;
    description?: string;
    onCancelClick: () => void;
    onConfirmClick: () => void;
    cancelText?: string;
    confirmText?: string;
}

const CustomAlertDialog = (props: ICustomAlertDialog) => {
    return (
        <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        <CustomText>
                            {props.title ??
                                "Hold on! You have unsaved changes."}
                        </CustomText>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        <CustomText className="text-gray-600">
                            {props.description ??
                                "If you exit this page now, your changes will not be saved."}
                        </CustomText>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <CustomButton
                        isInverse
                        onClick={props.onCancelClick}
                        addedClassname="text-xs"
                    >
                        {props.cancelText ?? "Cancel"}
                    </CustomButton>
                    <CustomButton
                        onClick={props.onConfirmClick}
                        addedClassname="text-xs"
                    >
                        {props.confirmText ?? "Yes, I'm sure"}
                    </CustomButton>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default observer(CustomAlertDialog);
