import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../Tooltip";
import { Info } from "lucide-react";

interface ICustomTooltipWrapper {
    tooltipText: React.ReactNode | string;
    children: React.ReactNode;
}

const CustomTooltipWrapper = (props: ICustomTooltipWrapper) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{props.children}</TooltipTrigger>
                <TooltipContent className="bg-white">
                    <p>{props.tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default CustomTooltipWrapper;
