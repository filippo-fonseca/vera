import React from "react";
import FadeButton, { FadeButtonProps } from "./FadeButton";

interface CustomButtonProps extends FadeButtonProps {
    addedClassname?: string;
    isInverse?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    addedClassname,
    isInverse,
    className,
    disabled,
    children,
    ...props
}) => {
    return (
        <FadeButton
            className={
                className ??
                `${addedClassname ?? ''} ${
                    isInverse
                        ? "stroke-black hover:stroke-white text-black border border-black font-semibold bg-white hover:bg-black hover:text-white"
                        : "stroke-white hover:stroke-black text-white border border-black font-semibold bg-black hover:bg-white hover:text-black"
                } ${
                    disabled
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                } font-semibold active:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-lg text-sm px-5 py-2.5 mb-2 transition-transform duration-150`
            }
            disabled={disabled}
            {...props}
        >
            {children}
        </FadeButton>
    );
};

export default CustomButton;
