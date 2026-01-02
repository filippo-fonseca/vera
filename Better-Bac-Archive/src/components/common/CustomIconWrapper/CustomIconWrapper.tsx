import React from "react";
import CustomDiv from "../CustomDiv";

interface ICustomIconWrapper {
    children: React.ReactNode;
}

const CustomIconWrapper = (props: ICustomIconWrapper) => {
    return (
        <CustomDiv className="flex items-center justify-center p-1 border shadow-md w-max rounded-lg">
            {props.children}
        </CustomDiv>
    );
};

export default CustomIconWrapper;
