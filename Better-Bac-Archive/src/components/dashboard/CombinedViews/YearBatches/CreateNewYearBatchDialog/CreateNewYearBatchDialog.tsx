import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import {
    Dialog,
    DialogContent,
    DialogFooter,
} from "@BetterBac/components/common/Dialog";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";
import { BugPlay, Info } from "lucide-react";
import { useYearBatchesStore } from "@BetterBac/state/Admin/YearBatches.store";
import CustomTooltipWrapper from "@BetterBac/components/common/CustomTooltipWrapper";
import { IB_ACTIVE_YEARS } from "@BetterBac/lib/utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@BetterBac/components/common/Select";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    setDoc,
} from "firebase/firestore";
import { IYearBatch } from "@BetterBac/lib/GlobalTypes";
import { v4 as uuidv4 } from "uuid";

const CreateNewYearBatchDialog = () => {
    const yearBatchesStore = useYearBatchesStore();
    const generalStore = useGeneralStore();
    const firestore = getFirestore();
    const [error, setError] = React.useState<boolean>(false);

    const [newYearBatchName, setNewYearBatchName] = React.useState<string>("");
    const [newYearBatchExamSession, setNewYearBatchExamSession] =
        React.useState<number | null>(null);

    const isCreateDisabled = React.useMemo(() => {
        return !newYearBatchName || newYearBatchExamSession === null;
    }, [newYearBatchName, newYearBatchExamSession]);

    const handleCreate = async () => {
        if (isCreateDisabled) return;

        try {
            // Generate a random ID
            const randomId = uuidv4();

            const newYearBatch: IYearBatch = {
                id: randomId, // Set the generated random ID
                name: newYearBatchName,
                linkedSchoolId: generalStore.userSchool?.id, // Adjust based on your store
                examSessionYear: newYearBatchExamSession,
                studentIds: [],
            };

            const yearBatchesRef = collection(firestore, "year_batches");
            const docRef = doc(yearBatchesRef, randomId); // Create a reference with the randomId

            // Set the document data at the specified path
            await setDoc(docRef, newYearBatch);

            // Optionally update the store or perform any other actions needed

            yearBatchesStore.setIsCreateNewYearBatchDialogOpen(false);
            generalStore.setIsToastVisible(true);
            generalStore.setToastText("Successfully created new year batch!");
            generalStore.setIsSuccessToast(true);

            setNewYearBatchName("");
            setNewYearBatchExamSession(null);
            setError(false);
        } catch (error) {
            console.error("Error creating year batch: ", error);
            setError(true);
            generalStore.setIsToastVisible(true);
            generalStore.setToastText(
                "Failed to create year batch. Please try again."
            );
            generalStore.setIsSuccessToast(false);
        }
    };

    return (
        <Dialog
            open={yearBatchesStore.isCreateNewYearBatchDialogOpen}
            onOpenChange={() => {
                yearBatchesStore.setIsCreateNewYearBatchDialogOpen(
                    !yearBatchesStore.isCreateNewYearBatchDialogOpen
                );
            }}
        >
            <DialogContent className="min-w-[650px] bg-white">
                <CustomDiv className="flex flex-col gap-3">
                    <CustomDiv className="flex items-center justify-center p-2 border shadow-md w-max rounded-xl">
                        <BugPlay size={36} />
                    </CustomDiv>
                    <CustomDiv>
                        <CustomText className="text-xl font-semibold">
                            Create a new year batch
                        </CustomText>
                        <CustomText className="text-sm text-gray-600">
                            You will be able to assign students to this year
                            batch upon creation.
                        </CustomText>
                    </CustomDiv>
                </CustomDiv>
                <div className="w-full mt-2">
                    <label className="block mb-2 text-sm font-medium">
                        <CustomText>What should it be called?</CustomText>
                    </label>
                    <CustomTextInput
                        value={newYearBatchName}
                        onChange={e => setNewYearBatchName(e.target.value)}
                        placeholder="Class of 2025 Seniors, etc."
                    />
                </div>
                <CustomDiv className="max-w-60">
                    <label
                        htmlFor="name-input"
                        className="flex items-center gap-1 mb-2 text-sm font-medium"
                    >
                        Linked IB examination session
                        <CustomTooltipWrapper
                            tooltipText={
                                <p className="text-center">
                                    The year in which the students in this year
                                    batch
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
                        value={newYearBatchExamSession?.toString() || ""}
                        onValueChange={val =>
                            setNewYearBatchExamSession(parseInt(val))
                        }
                    >
                        <SelectTrigger className="w-32 font-normal text-sm">
                            <SelectValue placeholder="--Select--" />
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
                </CustomDiv>
                <p className="text-xs text-gray-600 mt-2">
                    As a reminder,{" "}
                    <strong>
                        a year batch is merely a custom grouping of students
                    </strong>{" "}
                    {
                        "(usually, schools use them to delegate students to their respective IB examination sessions)"
                    }{" "}
                    to help you manage them more effectively on BetterBac. This
                    can be helpful when adding people to courses, evaluating
                    their transcripts, and in many more instances.
                </p>
                <DialogFooter className="mt-8">
                    <CustomButton
                        onClick={handleCreate}
                        disabled={isCreateDisabled}
                    >
                        Create
                    </CustomButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default observer(CreateNewYearBatchDialog);
