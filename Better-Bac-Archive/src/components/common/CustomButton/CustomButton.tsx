import React from "react";
import FadeButton, { FadeButtonProps } from "./FadeButton";

interface LoginButtonProps extends FadeButtonProps {
    addedClassname?: string;
    isInverse?: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({ ...props }) => {
    return (
        <FadeButton
            className={
                props.className ??
                `${props.addedClassname} ${
                    props.isInverse
                        ? "stroke-black hover:stroke-white text-black border border-black font-semibold bg-white hover:bg-black hover:text-white"
                        : "stroke-white hover:stroke-black text-white border border-black font-semibold bg-black hover:bg-white hover:text-black"
                } ${
                    props.disabled
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                } font-semibold  active:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-lg text-sm px-5 py-2.5 mb-2 transition-transform duration-150`
            }
            {...props}
        >
            {props.children}
        </FadeButton>
    );
};

export default LoginButton;
