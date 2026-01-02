import { Pencil, Trash } from "lucide-react";
import React from "react";
import CustomButton from "../CustomButton/CustomButton";
import CustomDiv from "../CustomDiv";
import CustomRoundedButton from "../CustomRoundedButton";
import CustomText from "../CustomText";
import CustomTextInput from "../CustomTextInput";
import MemberDisplay from "../MemberDisplay";
import SquirrelEmpty from "../SquirrelEmpty";
import { useYearBatchesStore } from "@BetterBac/state/Admin/YearBatches.store";
import { IUser } from "@BetterBac/lib/GlobalTypes";
import { observer } from "mobx-react";

interface IUsersPartOfTemplate {
    title: string;
    editButtonOnClick?: () => void;
    desc: string | React.ReactNode;
    queryValue: string;
    queryOnChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
    queryInputPlaceholder: string;
    roundedPlusButtonOnClick: () => void;
    userArray: IUser[];
    onRemoveUserClick: (id: string) => void;
}

const UsersPartOfTemplate = (props: IUsersPartOfTemplate) => {
    const yearBatchesStore = useYearBatchesStore();

    return (
        <CustomDiv className="space-y-6">
            <CustomDiv className="space-y-4">
                <CustomDiv>
                    {typeof props.desc !== "string" && (
                        <CustomText className="text-sm text-gray-600">
                            {props.desc}
                        </CustomText>
                    )}
                    <CustomDiv className="flex items-center gap-2">
                        <CustomText className="text-xl font-semibold">
                            {props.title}
                        </CustomText>
                        {props.editButtonOnClick && (
                            <CustomRoundedButton
                                onClick={props.editButtonOnClick}
                                customIcon={<Pencil size={12} />}
                                customButtonSizeString="size-6"
                            />
                        )}
                    </CustomDiv>
                    {typeof props.desc == "string" && (
                        <CustomText className="text-sm text-gray-600">
                            {props.desc}
                        </CustomText>
                    )}
                </CustomDiv>
                <CustomTextInput
                    placeholder={props.queryInputPlaceholder}
                    value={props.queryValue}
                    onChange={props.queryOnChangeHandler}
                />
            </CustomDiv>
            <hr />
            <CustomDiv className="space-y-8">
                <CustomDiv className="flex items-center justify-between">
                    <div className="leading-[0.2rem]">
                        <CustomText className="text-lg font-semibold">
                            Student List
                        </CustomText>
                        <CustomText className="text-sm text-gray-600">
                            Currently:{" "}
                            <strong>
                                {
                                    yearBatchesStore.currentYearBatch
                                        ?.studentIds.length
                                }
                            </strong>{" "}
                            {yearBatchesStore.currentYearBatch?.studentIds
                                .length === 1
                                ? "student"
                                : "students"}{" "}
                            in this year batch
                        </CustomText>
                    </div>
                    <CustomRoundedButton
                        onClick={props.roundedPlusButtonOnClick}
                    />
                </CustomDiv>
                <div className="h-[40.2vh] overflow-y-auto px-8">
                    {props.userArray.length == 0 ? (
                        <CustomDiv className="flex flex-col items-center justify-center gap-2 mt-4">
                            <SquirrelEmpty
                                header="Oop! No students found."
                                subHeader={
                                    props.queryValue !== ""
                                        ? "Try adjusting your query for better results."
                                        : "Add students to this year batch by clicking the button above."
                                }
                            />
                        </CustomDiv>
                    ) : (
                        <CustomDiv className="list-disc space-y-4">
                            {props.userArray.map(student => (
                                <MemberDisplay
                                    key={student.id}
                                    {...student}
                                    customRightComponent={
                                        <CustomButton
                                            className="flex items-center justify-center text-xs stroke-black hover:stroke-white font-semibold bg-white hover:bg-black hover:text-white active:scale-110 focus:outline-none border border-black focus:ring-4 focus:ring-gray-300 rounded-lg px-2 py-2 mb-2 transition-transform duration-150"
                                            onClick={e => {
                                                e.stopPropagation();
                                                props.onRemoveUserClick(
                                                    student.id
                                                );
                                            }}
                                        >
                                            <Trash size={14} />
                                        </CustomButton>
                                    }
                                />
                            ))}
                        </CustomDiv>
                    )}
                </div>
            </CustomDiv>
        </CustomDiv>
    );
};

export default observer(UsersPartOfTemplate);
