import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomIconWrapper from "@BetterBac/components/common/CustomIconWrapper";
import CustomText from "@BetterBac/components/common/CustomText";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import CustomTooltipWrapper from "@BetterBac/components/common/CustomTooltipWrapper";
import { IYearBatch } from "@BetterBac/lib/GlobalTypes";
import { IB_ACTIVE_YEARS } from "@BetterBac/lib/utils";
import { useYearBatchesStore } from "@BetterBac/state/Admin/YearBatches.store";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from "@BetterBac/components/common/Select";
import { ArrowLeft, FolderCog, Info } from "lucide-react";
import { observer } from "mobx-react";

interface IEditYearBatchView {
    onBackClick: () => void;
    tempYearBatchForEditing: IYearBatch;
    setTempYearBatchForEditing: React.Dispatch<
        React.SetStateAction<IYearBatch>
    >;
    handleEditRevertChanges: () => void;
    handleEditSave: () => void;
    CHANGES_MADE: boolean;
}
import React from "react";

const EditYearBatchView = (props: IEditYearBatchView) => {
    const yearBatchesStore = useYearBatchesStore();

    return (
        <CustomDiv className="flex flex-col justify-between">
            <CustomDiv className="space-y-6">
                <div
                    onClick={props.onBackClick}
                    className="flex items-center gap-1 w-max text-gray-600 hover:opacity-50 cursor-pointer transition-transform transform hover:scale-[1.02]"
                >
                    <ArrowLeft size={14} />
                    <CustomText className="text-sm">Back</CustomText>
                </div>
                <CustomDiv className="space-y-6">
                    <CustomDiv className="flex items-center gap-2">
                        <CustomDiv className="leading-[0.25rem] space-y-0.5">
                            <CustomDiv className="flex items-center gap-2">
                                <CustomIconWrapper>
                                    <FolderCog size={16} />
                                </CustomIconWrapper>
                                <CustomText className="text-lg font-semibold">
                                    Edit year batch
                                </CustomText>
                            </CustomDiv>

                            <CustomText className="text-sm text-gray-600">
                                {yearBatchesStore.currentYearBatch?.name}
                            </CustomText>
                        </CustomDiv>
                    </CustomDiv>
                    <div className="flex flex-col text-left w-full gap-4">
                        <div className="w-full">
                            <label className="block mb-2 text-sm font-medium">
                                <CustomText>Name</CustomText>
                            </label>
                            <CustomTextInput
                                value={props.tempYearBatchForEditing.name}
                                onChange={e =>
                                    props.setTempYearBatchForEditing(prev => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="2025 Gen IBDP Seniors, etc."
                            />
                        </div>
                    </div>
                    <div className="flex flex-col text-left w-full gap-4">
                        <div className="w-full">
                            <label
                                htmlFor="name-input"
                                className="flex items-center gap-1 mb-2 text-sm font-medium"
                            >
                                Linked IB examination session
                                <CustomTooltipWrapper
                                    tooltipText={
                                        <p className="text-center">
                                            The year in which the students in
                                            this year batch
                                            <br /> will be taking their final IB
                                            examinations.
                                        </p>
                                    }
                                >
                                    <Info className="size-4 text-gray-600 hover:text-black cursor-pointer" />
                                </CustomTooltipWrapper>
                            </label>
                            <Select
                                name="examSession"
                                value={
                                    props.tempYearBatchForEditing?.examSessionYear.toString() ||
                                    ""
                                }
                                onValueChange={val =>
                                    props.setTempYearBatchForEditing(prev => ({
                                        ...prev,
                                        examSessionYear: parseInt(val),
                                    }))
                                }
                            >
                                <SelectTrigger className="w-32 font-normal text-sm">
                                    <SelectValue placeholder="Select exam session" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectGroup>
                                        {IB_ACTIVE_YEARS.map((year, idx) => (
                                            <SelectItem
                                                key={idx}
                                                value={year.toString()}
                                            >
                                                May {year}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CustomDiv>
            </CustomDiv>
            <CustomDiv className="flex items-center justify-between">
                <CustomButton
                    isInverse
                    onClick={props.handleEditRevertChanges}
                    addedClassname={
                        props.CHANGES_MADE ? "opacity-1" : "opacity-0"
                    }
                >
                    Revert
                </CustomButton>
                <CustomButton
                    onClick={() => props.handleEditSave()}
                    addedClassname={
                        props.CHANGES_MADE ? "opacity-1" : "opacity-0"
                    }
                >
                    Save
                </CustomButton>
            </CustomDiv>
        </CustomDiv>
    );
};

export default observer(EditYearBatchView);
