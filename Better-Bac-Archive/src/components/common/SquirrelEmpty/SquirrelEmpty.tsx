import { Squirrel, Nut } from "lucide-react";
import React from "react";
import CustomDiv from "../CustomDiv";
import CustomText from "../CustomText";

interface ISquirrelEmpty {
    customSquirrelClassname?: string;
    customNutClassname?: string;
    header: string;
    subHeader?: string;
}

const SquirrelEmpty = (props: ISquirrelEmpty) => {
    return (
        <>
            <CustomDiv className="flex text-gray-600">
                <Squirrel
                    className={props.customSquirrelClassname ?? "size-12"}
                />
                <div className="flex items-end">
                    <Nut className={props.customNutClassname ?? "size-6"} />
                </div>
            </CustomDiv>
            <CustomDiv className="text-center text-gray-600">
                <CustomText className="text-md font-semibold mt-6">
                    {props.header}
                </CustomText>
                {props.subHeader && (
                    <CustomText className="text-sm text-gray-600">
                        {props.subHeader}
                    </CustomText>
                )}
            </CustomDiv>
        </>
    );
};

export default SquirrelEmpty;
