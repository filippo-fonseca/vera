import { IUser, IYearBatch } from "@BetterBac/lib/GlobalTypes";
import React from "react";
import Link from "next/link";
import { Mail, Pencil } from "lucide-react";
import { observer } from "mobx-react";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import { getCurrentSchoolYear } from "@BetterBac/lib/extraUtils/getCurrentSchoolYear.util";
import { useGeneralStore } from "@BetterBac/state/General.store";

interface IYearBatchElem extends IYearBatch {
    onClick: () => void;
}

const YearBatchElem = (props: IYearBatchElem) => {
    const generalStore = useGeneralStore();
    return (
        <div
            className="flex items-center justify-between space-x-4 cursor-pointer transition-transform transform hover:scale-[1.01]"
            onClick={props.onClick}
        >
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-none">
                    {props.name}
                </p>
                <p className="text-sm text-gray-600 text-muted-foreground">
                    {props.isNov ? "Nov " : "May "}
                    {props.examSessionYear} • {props.studentIds.length}{" "}
                    {props.studentIds.length === 1 ? "student" : "students"}
                </p>
            </div>
            <CustomDiv>
                <CustomButton className="flex items-center justify-center text-xs stroke-black hover:stroke-white font-semibold bg-white hover:bg-black hover:text-white active:scale-110 focus:outline-none border border-black focus:ring-4 focus:ring-gray-300 rounded-lg px-2 py-2 mb-2 transition-transform duration-150">
                    <Pencil size={14} />
                </CustomButton>
            </CustomDiv>
        </div>
    );
};

export default observer(YearBatchElem);
