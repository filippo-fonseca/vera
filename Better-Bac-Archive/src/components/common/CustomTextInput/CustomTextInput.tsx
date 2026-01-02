import React, { ChangeEvent, InputHTMLAttributes } from "react";
import FadeInput, { FadeInputProps } from "./FadeInput";
import CustomText from "../CustomText/CustomText";
import Link from "next/link";

interface CustomTextInputProps extends FadeInputProps {
    addedClassname?: string;
    description?: string;
    onEnterPress?: (e) => void;
    customBottomText?: string;
    noShadow?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
    onChange,
    description,
    ...props
}) => {
    return (
        <div className="custom-text-input-wrapper">
            <FadeInput
                onChange={onChange}
                className={
                    props.className ??
                    `${props.addedClassname} ${
                        !props.noShadow && "shadow-md"
                    } border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full p-2.5`
                }
                {...props}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        if (props.onEnterPress) props.onEnterPress(e);
                    }
                }}
            />
            {props.type == "password" && (
                <div className="mt-1">
                    <CustomText className="text-xs text-gray-500">
                        {props.customBottomText ?? (
                            <>
                                {" "}
                                Forgot your password?{" "}
                                <Link href="/auth/reset">
                                    <span className="underline hover:opacity-50 font-medium cursor-pointer">
                                        Reset it.
                                    </span>
                                </Link>
                            </>
                        )}
                    </CustomText>
                </div>
            )}
            {description && (
                <div className="mt-1">
                    <CustomText className="text-gray-500 text-xs">
                        {description}
                    </CustomText>
                </div>
            )}
        </div>
    );
};

export default CustomTextInput;
