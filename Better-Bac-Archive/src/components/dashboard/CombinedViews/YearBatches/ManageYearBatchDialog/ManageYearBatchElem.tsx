import { useEffect, useState } from "react";
import {
    collection,
    doc,
    onSnapshot,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDoc,
} from "firebase/firestore";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import { Dialog, DialogContent } from "@BetterBac/components/common/Dialog";
import { useYearBatchesStore } from "@BetterBac/state/Admin/YearBatches.store";
import { observer } from "mobx-react";
import { db } from "../../../../../../config/firebase";
import { IUser, IYearBatch } from "@BetterBac/lib/GlobalTypes";
import { useGeneralStore } from "@BetterBac/state/General.store";
import GeneralSpinnerLoader from "@BetterBac/components/common/GeneralSpinnerLoader";
import AddUsersTemplate from "@BetterBac/components/common/AddUsersTemplate";
import UsersPartOfTemplate from "@BetterBac/components/common/UsersPartOfTemplate";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import { ArrowLeft, FolderCog, Info, Trash, UserRoundPlus } from "lucide-react";
import CustomIconWrapper from "@BetterBac/components/common/CustomIconWrapper";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomTooltipWrapper from "@BetterBac/components/common/CustomTooltipWrapper";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@BetterBac/components/common/Select";
import { IB_ACTIVE_YEARS } from "@BetterBac/lib/utils";
import CustomRoundedButton from "@BetterBac/components/common/CustomRoundedButton";

const ManageYearBatchElem = () => {
    const yearBatchesStore = useYearBatchesStore();
    const generalStore = useGeneralStore();

    const [students, setStudents] = useState<IUser[]>([]);
    const [yearBatchStudentsQuery, setYearBatchStudentsQuery] =
        useState<string>("");
    const [yearBatchStudents, setYearBatchStudents] = useState<IUser[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedStudents, setSelectedStudents] = useState<IUser[]>([]);
    const [isAddPeopleViewEnabled, setIsAddPeopleViewEnabled] = useState(false);
    const [poolToAdd, setPoolToAdd] = useState<IUser[]>([]);

    const allUsers = generalStore.userSchoolAllUsers;

    const [loading, setLoading] = useState(false);
    const [editYearBatch, setEditYearBatch] = useState(false);

    //edit state:
    const [tempYearBatchForEditing, setTempYearBatchForEditing] =
        useState<IYearBatch>(yearBatchesStore.currentYearBatch);

    const CHANGES_MADE: boolean =
        tempYearBatchForEditing.name !==
            yearBatchesStore.currentYearBatch.name ||
        tempYearBatchForEditing.examSessionYear !==
            yearBatchesStore.currentYearBatch.examSessionYear;

    const filterForStudents = (
        users: IUser[],
        searchQuery: string,
        excludeIds: string[]
    ) => {
        const queryLower = searchQuery.toLowerCase();
        return users
            .filter(
                user =>
                    !excludeIds.includes(user.id) &&
                    !user.isEducator &&
                    !yearBatchesStore.currentYearBatch.studentIds.includes(
                        user.id
                    )
            )
            .filter(
                user =>
                    user.displayName.toLowerCase().includes(queryLower) ||
                    user.email.toLowerCase().includes(queryLower)
            )
            .sort((a, b) =>
                a.displayName
                    .toLowerCase()
                    .localeCompare(b.displayName.toLowerCase())
            );
    };

    const filterForStudentsInYearBatch = (query: string) => {
        const queryLower = query.toLowerCase();
        return students.filter(
            student =>
                student.displayName.toLowerCase().includes(queryLower) ||
                student.email.toLowerCase().includes(queryLower)
        );
    };

    useEffect(() => {
        setYearBatchStudents(
            filterForStudentsInYearBatch(yearBatchStudentsQuery)
        );
    }, [yearBatchStudentsQuery, students]);

    useEffect(() => {
        if (yearBatchesStore.currentYearBatch) {
            const yearBatchRef = doc(
                db,
                "year_batches",
                yearBatchesStore.currentYearBatch.id
            );

            const unsubscribe = onSnapshot(
                yearBatchRef,
                async docSnapshot => {
                    if (docSnapshot.exists()) {
                        const updatedYearBatch = docSnapshot.data();
                        yearBatchesStore.setCurrentYearBatch(
                            updatedYearBatch as IYearBatch
                        );

                        // Update students based on the new studentIds
                        const updatedStudentIds =
                            updatedYearBatch.studentIds || [];
                        const updatedStudents = allUsers
                            .filter(user => updatedStudentIds.includes(user.id))
                            .sort((a, b) =>
                                a.displayName
                                    .split(" ")[1]
                                    .localeCompare(b.displayName.split(" ")[1])
                            );
                        setStudents(updatedStudents);
                    }
                },
                error => {
                    console.error(
                        "Error listening to year batch document:",
                        error
                    );
                }
            );

            return () => unsubscribe(); // Cleanup on unmount
        }
    }, [students, isAddPeopleViewEnabled]);

    useEffect(() => {
        if (yearBatchesStore.currentYearBatch) {
            const studentIds = yearBatchesStore.currentYearBatch.studentIds;
            const filteredStudents = allUsers.filter(user =>
                studentIds.includes(user.id)
            );

            setStudents(
                filteredStudents.sort((a, b) =>
                    a.displayName
                        .split(" ")[1]
                        .localeCompare(b.displayName.split(" ")[1])
                )
            );
        }
    }, [allUsers, yearBatchesStore.currentYearBatch, isAddPeopleViewEnabled]);

    useEffect(() => {
        setPoolToAdd(
            filterForStudents(
                allUsers,
                searchQuery,
                yearBatchesStore.currentYearBatch?.studentIds || []
            )
        );
    }, [isAddPeopleViewEnabled, students]);

    const deleteStudent = async (studentId: string) => {
        try {
            if (yearBatchesStore.currentYearBatch) {
                const yearBatchRef = doc(
                    db,
                    "year_batches",
                    yearBatchesStore.currentYearBatch.id
                );
                await updateDoc(yearBatchRef, {
                    studentIds: arrayRemove(studentId),
                });
                setStudents(prevStudents =>
                    prevStudents.filter(student => student.id !== studentId)
                );
            }
        } catch (error) {
            console.error("Error removing student:", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        if (yearBatchesStore.currentYearBatch) {
            const yearBatchRef = doc(
                db,
                "year_batches",
                yearBatchesStore.currentYearBatch.id
            );
            const studentIdsToAdd = selectedStudents.map(student => student.id);
            try {
                await updateDoc(yearBatchRef, {
                    studentIds: arrayUnion(...studentIdsToAdd),
                });
                // Clear selection and update the view
                setSelectedStudents([]);
                setIsAddPeopleViewEnabled(false); // Disable add people view after save

                // Trigger a re-fetch or update of students
                const yearBatchDoc = await getDoc(yearBatchRef);
                const updatedStudentIds = yearBatchDoc.data()?.studentIds || [];
                const updatedStudents = allUsers.filter(user =>
                    updatedStudentIds.includes(user.id)
                );
                setStudents(updatedStudents);
            } catch (error) {
                console.error("Error saving selected students:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClear = () => {
        setSelectedStudents([]);
    };

    //edit functions:
    const handleEditSave = async () => {
        if (tempYearBatchForEditing !== yearBatchesStore.currentYearBatch) {
            const yearBatchRef = doc(
                db,
                "year_batches",
                yearBatchesStore.currentYearBatch?.id
            );
            try {
                await updateDoc(yearBatchRef, {
                    name: tempYearBatchForEditing.name,
                    examSessionYear: tempYearBatchForEditing.examSessionYear,
                }).then(() => {
                    yearBatchesStore.setCurrentYearBatch(
                        tempYearBatchForEditing
                    );
                    setEditYearBatch(false);
                });
            } catch (error) {
                console.error("Error saving edited year batch:", error);
                //TODO: Proper error handling with common UI toast
            }
        }
    };

    const handleEditRevertChanges = () => {
        if (tempYearBatchForEditing !== yearBatchesStore.currentYearBatch) {
            setTempYearBatchForEditing(yearBatchesStore.currentYearBatch);
        }
    };

    return (
        <Dialog
            open={yearBatchesStore.isYearBatchDialogOpen}
            onOpenChange={() => {
                if (yearBatchesStore.isYearBatchDialogOpen) {
                    yearBatchesStore.setIsYearBatchDialogOpen(false);
                }
            }}
        >
            <DialogContent
                className={`min-w-[650px] bg-white h-[67vh] overflow-y-hidden ${
                    isAddPeopleViewEnabled && "pt-6 px-6 pb-2"
                }`}
            >
                {loading ? (
                    <GeneralSpinnerLoader />
                ) : (
                    <>
                        {isAddPeopleViewEnabled ? (
                            <AddUsersTemplate
                                title={`Add students to ${yearBatchesStore.currentYearBatch?.name}`}
                                desc="Click on a student to add them to this year batch."
                                queryValue={searchQuery}
                                queryOnChangeHandler={e =>
                                    setSearchQuery(e.target.value)
                                }
                                queryInputPlaceholder={`Search students at ${generalStore.userSchool?.name}`}
                                poolToAdd={poolToAdd}
                                selectedStudents={selectedStudents}
                                setSelectedStudents={setSelectedStudents}
                                handleSave={handleSave}
                                handleClear={handleClear}
                                backButtonText="Back"
                                backButtonOnClick={() => {
                                    setSelectedStudents([]);
                                    setIsAddPeopleViewEnabled(false);
                                    setSearchQuery("");
                                }}
                            />
                        ) : (
                            <>
                                {editYearBatch ? (
                                    <CustomDiv className="flex flex-col justify-between">
                                        <CustomDiv className="space-y-6">
                                            <div
                                                onClick={() =>
                                                    setEditYearBatch(false)
                                                }
                                                className="flex items-center gap-1 w-max text-gray-600 hover:opacity-50 cursor-pointer transition-transform transform hover:scale-[1.02]"
                                            >
                                                <ArrowLeft size={14} />
                                                <CustomText className="text-sm">
                                                    Back
                                                </CustomText>
                                            </div>
                                            <CustomDiv className="space-y-6">
                                                <CustomDiv className="flex items-center gap-2">
                                                    <CustomDiv className="leading-[0.25rem] space-y-1 w-full">
                                                        <CustomDiv className="flex justify-between w-full">
                                                            <CustomDiv className="flex items-center gap-2">
                                                                <CustomIconWrapper>
                                                                    <FolderCog
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </CustomIconWrapper>
                                                                <CustomText className="text-lg font-semibold">
                                                                    Edit year
                                                                    batch
                                                                </CustomText>
                                                            </CustomDiv>
                                                            <CustomRoundedButton
                                                                onClick={() =>
                                                                    null
                                                                }
                                                                customIcon={
                                                                    <Trash
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                        </CustomDiv>

                                                        <CustomText className="text-sm text-gray-600">
                                                            {
                                                                yearBatchesStore
                                                                    .currentYearBatch
                                                                    ?.name
                                                            }
                                                        </CustomText>
                                                    </CustomDiv>
                                                </CustomDiv>
                                                <div className="flex flex-col text-left w-full gap-4">
                                                    <div className="w-full">
                                                        <label className="block mb-2 text-sm font-medium">
                                                            <CustomText>
                                                                Name
                                                            </CustomText>
                                                        </label>
                                                        <CustomTextInput
                                                            value={
                                                                tempYearBatchForEditing.name
                                                            }
                                                            onChange={e =>
                                                                setTempYearBatchForEditing(
                                                                    prev => ({
                                                                        ...prev,
                                                                        name: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                )
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
                                                            Linked IB
                                                            examination session
                                                            <CustomTooltipWrapper
                                                                tooltipText={
                                                                    <p className="text-center">
                                                                        The year
                                                                        in which
                                                                        the
                                                                        students
                                                                        in this
                                                                        year
                                                                        batch
                                                                        <br />{" "}
                                                                        will be
                                                                        taking
                                                                        their
                                                                        final IB
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
                                                                tempYearBatchForEditing?.examSessionYear.toString() ||
                                                                ""
                                                            }
                                                            onValueChange={val =>
                                                                setTempYearBatchForEditing(
                                                                    prev => ({
                                                                        ...prev,
                                                                        examSessionYear:
                                                                            parseInt(
                                                                                val
                                                                            ),
                                                                    })
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="w-32 font-normal text-sm">
                                                                <SelectValue placeholder="Select exam session" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                <SelectGroup>
                                                                    {IB_ACTIVE_YEARS.map(
                                                                        (
                                                                            year,
                                                                            idx
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                value={year.toString()}
                                                                            >
                                                                                May{" "}
                                                                                {
                                                                                    year
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
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
                                                onClick={
                                                    handleEditRevertChanges
                                                }
                                                addedClassname={
                                                    CHANGES_MADE
                                                        ? "opacity-1"
                                                        : "opacity-0"
                                                }
                                            >
                                                Cancel
                                            </CustomButton>
                                            <CustomButton
                                                onClick={handleEditSave}
                                                addedClassname={
                                                    CHANGES_MADE
                                                        ? "opacity-1"
                                                        : "opacity-0"
                                                }
                                            >
                                                Save
                                            </CustomButton>
                                        </CustomDiv>
                                    </CustomDiv>
                                ) : (
                                    <UsersPartOfTemplate
                                        title={
                                            yearBatchesStore.currentYearBatch
                                                ?.name
                                        }
                                        editButtonOnClick={() =>
                                            setEditYearBatch(true)
                                        }
                                        desc={
                                            <CustomDiv className="flex items-center justify-center border shadow-md px-1.5 h-6 rounded-lg w-max text-white bg-black border-black mb-2">
                                                <CustomText className="text-xs font-semibold">
                                                    {yearBatchesStore
                                                        .currentYearBatch?.isNov
                                                        ? "Nov "
                                                        : "May "}
                                                    {
                                                        yearBatchesStore
                                                            .currentYearBatch
                                                            ?.examSessionYear
                                                    }
                                                </CustomText>
                                            </CustomDiv>
                                        }
                                        queryInputPlaceholder="Search students in this year batch"
                                        queryValue={yearBatchStudentsQuery}
                                        queryOnChangeHandler={e =>
                                            setYearBatchStudentsQuery(
                                                e.target.value
                                            )
                                        }
                                        roundedPlusButtonOnClick={() =>
                                            setIsAddPeopleViewEnabled(true)
                                        }
                                        userArray={yearBatchStudents}
                                        onRemoveUserClick={deleteStudent}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default observer(ManageYearBatchElem);
