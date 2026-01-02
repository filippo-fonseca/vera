import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@BetterBac/components/common/Select";
import { ISchool } from "@BetterBac/lib/GlobalTypes";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../../../../config/firebase";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@BetterBac/components/common/Tooltip";
import CustomTooltipWrapper from "@BetterBac/components/common/CustomTooltipWrapper";
import { useSchoolStore } from "@BetterBac/state/Admin/School.store";
import { observer } from "mobx-react";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const SchoolSettings = () => {
    const [localSchool, setLocalSchool] = useState<ISchool | null>(null);
    const schoolStore = useSchoolStore();
    const generalStore = useGeneralStore();
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        if (generalStore.userSchool) {
            schoolStore.setLocalSchoolInstance({ ...generalStore.userSchool });
        }
    };

    // Initialize schoolStore.localSchoolInstance with the current userSchool data
    useEffect(() => {
        if (generalStore.userSchool) {
            setLocalSchool(generalStore.userSchool);
        }
    }, [generalStore.userSchool, generalStore.activeSchoolDashboardState]);

    React.useEffect(() => {
        if (localSchool) {
            schoolStore.setLocalSchoolInstance(localSchool);
        }
    }, [localSchool]);

    // Handle start month selection
    const handleStartMonthSelect = (newStartMonth: string) => {
        if (schoolStore.localSchoolInstance) {
            schoolStore.setLocalSchoolInstance({
                ...schoolStore.localSchoolInstance,
                schoolYearStartMonth: months.indexOf(newStartMonth),
            });
        }
    };

    // Handle end month selection
    const handleEndMonthSelect = (newStartMonth: string) => {
        if (schoolStore.localSchoolInstance) {
            schoolStore.setLocalSchoolInstance({
                ...schoolStore.localSchoolInstance,
                schoolYearEndMonth: months.indexOf(newStartMonth),
            });
        }
    };

    // Save changes to Firestore and update generalStore
    const handleSave = async () => {
        if (schoolStore.localSchoolInstance) {
            setLoading(true); // Start loader
            try {
                let updatedPhotoURL = schoolStore.localSchoolInstance.photoURL;

                // Update Firestore
                const schoolRef = doc(
                    db,
                    "schools",
                    generalStore.userSchool.id
                );

                await updateDoc(schoolRef, {
                    schoolYearStartMonth:
                        schoolStore.localSchoolInstance.schoolYearStartMonth,
                    schoolYearEndMonth:
                        schoolStore.localSchoolInstance.schoolYearEndMonth,
                });

                // Update generalStore after saving
                generalStore.userSchool = {
                    ...schoolStore.localSchoolInstance,
                };
            } catch (error) {
                console.error("Error saving data:", error);
            } finally {
                setLoading(false); // Stop loader
            }
        }
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (schoolStore.localSchoolInstance) {
            schoolStore.setLocalSchoolInstance({
                ...schoolStore.localSchoolInstance,
                [name]: value,
            });
        }
    };

    return (
        <div className="w-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start px-1">
                <h2 className="text-xl font-bold">School Settings</h2>
                <div
                    className={`flex items-center justify-center gap-4 ${
                        JSON.stringify(schoolStore.localSchoolInstance) !==
                        JSON.stringify(generalStore.userSchool)
                            ? "opacity-100"
                            : "opacity-0"
                    }`}
                >
                    <CustomButton
                        isInverse
                        onClick={handleCancel}
                        addedClassname="text-xs"
                    >
                        Cancel changes
                    </CustomButton>
                    <CustomButton onClick={handleSave} addedClassname="text-xs">
                        Save
                    </CustomButton>
                </div>
            </div>
            <hr className="mt-2 mb-6" />
            <div className="flex flex-col flex-1 h-full overflow-y-scroll overflow-x-hidden p-1 gap-4">
                <CustomDiv className="max-w-96">
                    <label
                        htmlFor="name-input"
                        className="flex items-center gap-1 mb-2 text-sm font-medium"
                    >
                        School year start month
                        <CustomTooltipWrapper tooltipText="The month that marks the beginning of your school's academic calendar every year.">
                            <Info className="size-4 text-gray-600 hover:text-black cursor-pointer" />
                        </CustomTooltipWrapper>
                    </label>
                    <Select
                        name="timezone"
                        value={
                            months[
                                schoolStore.localSchoolInstance
                                    ?.schoolYearStartMonth
                            ] || ""
                        }
                        onValueChange={val => handleStartMonthSelect(val)}
                        // className="border rounded px-3 py-2"
                    >
                        <SelectTrigger className="w-96 font-normal text-sm">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectGroup>
                                {months.map((month, idx) => (
                                    <SelectItem key={idx} value={month}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CustomDiv>
                <CustomDiv className="max-w-96">
                    <label
                        htmlFor="name-input"
                        className="flex items-center gap-1 mb-2 text-sm font-medium"
                    >
                        School year end month
                        <CustomTooltipWrapper tooltipText="The month that marks the end of your school's academic calendar every year.">
                            <Info className="size-4 text-gray-600 hover:text-black cursor-pointer" />
                        </CustomTooltipWrapper>
                    </label>
                    <Select
                        name="timezone"
                        value={
                            months[
                                schoolStore.localSchoolInstance
                                    ?.schoolYearEndMonth
                            ] || ""
                        }
                        onValueChange={val => handleEndMonthSelect(val)}
                        // className="border rounded px-3 py-2"
                    >
                        <SelectTrigger className="w-96 font-normal text-sm">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectGroup>
                                {months.map((month, idx) => (
                                    <SelectItem key={idx} value={month}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CustomDiv>
                <CustomDiv className="max-w-96">
                    <label
                        htmlFor="name-input"
                        className="flex items-center gap-1 mb-2 text-sm font-medium"
                    >
                        School domain extension{" "}
                        <CustomTooltipWrapper tooltipText="Allows for user validation and other features.">
                            <Info className="size-4 text-gray-600 hover:text-black cursor-pointer" />
                        </CustomTooltipWrapper>
                    </label>

                    <CustomTextInput
                        id="name-input"
                        type="text"
                        name="domain"
                        placeholder="yourschool.edu"
                        value={schoolStore.localSchoolInstance?.domain || ""}
                        onChange={handleInputChange}
                    />
                </CustomDiv>
            </div>
        </div>
    );
};

export default observer(SchoolSettings);
