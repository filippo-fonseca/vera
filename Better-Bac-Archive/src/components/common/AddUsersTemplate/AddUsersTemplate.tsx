import { ArrowLeft, Check, Plus, Trash, UserRoundPlus } from "lucide-react";
import { observer } from "mobx-react";
import React from "react";
import CustomButton from "../CustomButton/CustomButton";
import CustomDiv from "../CustomDiv";
import CustomRoundedButton from "../CustomRoundedButton";
import CustomText from "../CustomText";
import CustomTextInput from "../CustomTextInput";
import MemberDisplay from "../MemberDisplay";
import SquirrelEmpty from "../SquirrelEmpty";
import CustomIconWrapper from "../CustomIconWrapper";
import { IUser } from "@BetterBac/lib/GlobalTypes";

interface IAddUsersTemplate {
    title: string;
    desc: string;
    queryValue: string;
    queryOnChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
    queryInputPlaceholder: string;
    backButtonText?: string;
    backButtonOnClick?: () => void;
    poolToAdd: IUser[];
    selectedStudents: IUser[];
    setSelectedStudents: React.Dispatch<React.SetStateAction<IUser[]>>;
    handleClear: () => void;
    handleSave: () => void;
}

const AddUsersTemplate = (props: IAddUsersTemplate) => {
    return (
        <CustomDiv className="flex flex-col justify-between">
            <CustomDiv className="space-y-6">
                {props.backButtonText && (
                    <div
                        onClick={props.backButtonOnClick}
                        className="flex items-center gap-1 w-max text-gray-600 hover:opacity-50 cursor-pointer transition-transform transform hover:scale-[1.02]"
                    >
                        <ArrowLeft size={14} />
                        <CustomText className="text-sm">
                            {props.backButtonText}
                        </CustomText>
                    </div>
                )}
                <CustomDiv className="space-y-6">
                    <CustomDiv className="flex items-center gap-2">
                        <CustomDiv className="leading-[0.25rem] space-y-0.5">
                            <CustomDiv className="flex items-center gap-2">
                                <CustomIconWrapper>
                                    <UserRoundPlus size={16} />
                                </CustomIconWrapper>
                                <CustomText className="text-lg font-semibold">
                                    {props.title}
                                </CustomText>
                            </CustomDiv>

                            <CustomText className="text-sm text-gray-600">
                                {props.desc}
                            </CustomText>
                        </CustomDiv>
                    </CustomDiv>
                    <CustomDiv className="mb-4 flex flex-col gap-1">
                        <CustomTextInput
                            placeholder={props.queryInputPlaceholder}
                            value={props.queryValue}
                            onChange={props.queryOnChangeHandler}
                        />
                        <CustomDiv className="flex items-center justify-end">
                            <CustomText className="text-xs text-gray-600">
                                {props.selectedStudents.length === 0
                                    ? "No users selected"
                                    : props.selectedStudents.length === 1
                                    ? "1 user selected"
                                    : `${props.selectedStudents.length} users selected`}
                            </CustomText>
                        </CustomDiv>
                    </CustomDiv>
                    <div className="h-[32vh] overflow-y-auto px-8">
                        <CustomDiv className="list-disc space-y-4">
                            {props.poolToAdd.length === 0 ? (
                                <CustomDiv className="flex flex-col items-center justify-center gap-2">
                                    <SquirrelEmpty
                                        header="Oop! No eligible people found."
                                        subHeader={
                                            props.queryValue !== "" &&
                                            "Try adjusting your query for better results."
                                        }
                                    />
                                </CustomDiv>
                            ) : (
                                <>
                                    {props.poolToAdd.map(user => {
                                        const isSelected =
                                            props.selectedStudents.some(
                                                selected =>
                                                    selected.id === user.id
                                            );

                                        return (
                                            <MemberDisplay
                                                key={user.id}
                                                {...user}
                                                customRightComponent={
                                                    <CustomButton
                                                        className={`flex items-center justify-center text-xs  ont-semibold ${
                                                            isSelected
                                                                ? "bg-black hover:opacity-70 text-white"
                                                                : "bg-white hover:bg-black hover:text-white"
                                                        }  active:scale-110 focus:outline-none border border-black focus:ring-4 focus:ring-gray-300 rounded-lg px-2 py-2 mb-2 transition-transform duration-150`}
                                                    >
                                                        {isSelected ? (
                                                            <Check size={14} />
                                                        ) : (
                                                            <Plus size={14} />
                                                        )}
                                                    </CustomButton>
                                                }
                                                generalOnClick={() => {
                                                    props.setSelectedStudents(
                                                        prev =>
                                                            prev.some(
                                                                selected =>
                                                                    selected.id ===
                                                                    user.id
                                                            )
                                                                ? prev.filter(
                                                                      selected =>
                                                                          selected.id !==
                                                                          user.id
                                                                  )
                                                                : [
                                                                      ...prev,
                                                                      user,
                                                                  ]
                                                    );
                                                }}
                                            />
                                        );
                                    })}
                                </>
                            )}
                        </CustomDiv>
                    </div>
                </CustomDiv>
            </CustomDiv>
            <CustomDiv className="flex items-center justify-between">
                <CustomButton
                    isInverse
                    onClick={props.handleClear}
                    addedClassname={`text-xs ${
                        props.selectedStudents.length === 0 && "opacity-0"
                    }`}
                >
                    Clear
                </CustomButton>
                <CustomButton
                    onClick={props.handleSave}
                    addedClassname={`text-xs ${
                        props.selectedStudents.length === 0 && "opacity-0"
                    }`}
                >
                    Save
                </CustomButton>
            </CustomDiv>
        </CustomDiv>
    );
};

export default observer(AddUsersTemplate);
