import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import { useYearBatchesStore } from "@BetterBac/state/Admin/YearBatches.store";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../config/firebase";
import { IYearBatch } from "@BetterBac/lib/GlobalTypes";
import YearBatchElem from "./YearBatchElem";
import ManageYearBatchDialog from "./ManageYearBatchDialog";
import CustomIconWrapper from "@BetterBac/components/common/CustomIconWrapper";
import { Calendar, FolderCog } from "lucide-react";
import CustomRoundedButton from "@BetterBac/components/common/CustomRoundedButton";
import ManagerialPageHeader from "@BetterBac/components/common/ManagerialPageHeader";
import CreateNewYearBatchDialog from "./CreateNewYearBatchDialog";
import SquirrelEmpty from "@BetterBac/components/common/SquirrelEmpty";

const YearBatches = () => {
    const generalStore = useGeneralStore();
    const yearBatchesStore = useYearBatchesStore();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const filteredYearBatches = yearBatchesStore.yearBatchesForSchool
        ?.filter(batch =>
            batch.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => (a.examSessionYear ?? 0) - (b.examSessionYear ?? 0)); // Sort by examSessionNumber

    return (
        <>
            {yearBatchesStore.isYearBatchDialogOpen && (
                <ManageYearBatchDialog />
            )}
            <CreateNewYearBatchDialog />
            <div className="flex-1 h-full ml-3 flex flex-col p-6 bg-white border rounded-xl shadow-md">
                <ManagerialPageHeader
                    icon={<FolderCog size={16} />}
                    title="Year batches"
                    description="Group students by their examination session, graduation date, or whatever criteria you prefer."
                    roundedButtonProps={{
                        onClick: () =>
                            yearBatchesStore.setIsCreateNewYearBatchDialogOpen(
                                true
                            ),
                    }}
                />
                <CustomDiv className="flex items-end justify-between mt-4 mb-6">
                    <CustomDiv className="flex flex-col gap-4">
                        <CustomDiv className="w-96">
                            <CustomTextInput
                                type="text"
                                placeholder={`Search year batches`}
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </CustomDiv>
                    </CustomDiv>
                </CustomDiv>
                <hr className="mb-8" />
                <CustomDiv className="space-y-4 w-full">
                    {filteredYearBatches.length == 0 ? (
                        <div className="flex flex-col items-center gap-4">
                            <SquirrelEmpty
                                header="Oop! No year batches found."
                                subHeader={
                                    searchQuery == ""
                                        ? "Create one on the top right of this page!"
                                        : "Try adjusting your search query."
                                }
                            />
                        </div>
                    ) : (
                        filteredYearBatches?.map(
                            (batch: IYearBatch, idx: number) => (
                                <YearBatchElem
                                    key={idx}
                                    onClick={() => {
                                        yearBatchesStore.setCurrentYearBatch(
                                            batch
                                        );
                                        yearBatchesStore.setIsYearBatchDialogOpen(
                                            true
                                        );
                                    }}
                                    {...batch}
                                />
                            )
                        )
                    )}
                </CustomDiv>
            </div>
        </>
    );
};

export default observer(YearBatches);
