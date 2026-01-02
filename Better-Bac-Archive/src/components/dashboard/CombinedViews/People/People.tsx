import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { IUser } from "@BetterBac/lib/GlobalTypes";
import { usePeopleStore } from "@BetterBac/state/Admin/People.store";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { db } from "../../../../../config/firebase";
import MemberDisplay from "@BetterBac/components/common/MemberDisplay";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@BetterBac/components/common/Select";
import UserManagementDialog from "./UserManagementDialog";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import NewUserDialog from "./NewUserDialog";
import CustomRoundedButton from "@BetterBac/components/common/CustomRoundedButton";
import { ChevronLeft, ChevronRight, Plus, User } from "lucide-react";
import CustomIconWrapper from "@BetterBac/components/common/CustomIconWrapper";
import ManagerialPageHeader from "@BetterBac/components/common/ManagerialPageHeader";
import SquirrelEmpty from "@BetterBac/components/common/SquirrelEmpty";
import { useYearBatchesStore } from "@BetterBac/state/Admin/YearBatches.store";
import { IB_ACTIVE_YEARS } from "@BetterBac/lib/utils";
import { outputFilteredUsersById } from "@BetterBac/lib/extraUtils/outputFilteredUsersById";
import { outputFilteredUsersByLinkedSchoolId } from "@BetterBac/lib/extraUtils/outputFilteredUsersByLinkedSchoolId";

const ITEMS_PER_PAGE = 14;

const People = observer(() => {
    const yearBatchesStore = useYearBatchesStore();
    const generalStore = useGeneralStore();
    const peopleStore = usePeopleStore();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [userType, setUserType] = useState<string>("all"); // "all", "educator", or "student"
    const [graduationYear, setGraduationYear] = useState<number | "all">("all"); // specific year or "all"
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        const schoolMembers = outputFilteredUsersByLinkedSchoolId({
            userArray: generalStore.userSchoolAllUsers,
            linkedSchoolId: generalStore.userSchool?.id,
        });
        peopleStore.setSchoolMembers(schoolMembers);
    }, [peopleStore, generalStore.userSchool?.id]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleUserTypeChange = (value: string) => {
        setUserType(value);
        setGraduationYear("all");
        setCurrentPage(1);
    };

    const handleYearBatchFilterChange = (value: string) => {
        setGraduationYear(value === "all" ? "all" : parseInt(value, 10));
        setCurrentPage(1);
    };

    const getYearBatchesForUser = (userId: string) => {
        return yearBatchesStore.yearBatchesForSchool.filter(yearBatch =>
            yearBatch.studentIds.includes(userId)
        );
    };

    const filteredMembers = peopleStore.schoolMembers?.filter(person => {
        const matchesSearchQuery = `${person.displayName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const isStudent =
            person.isEducator === false ||
            person.isEducator === null ||
            person.isEducator === undefined;
        const matchesUserType =
            userType === "all" ||
            (userType === "student" ? isStudent : person.isEducator === true);

        const yearBatches = getYearBatchesForUser(person.id);
        const isInYearBatch =
            graduationYear === "all" ||
            yearBatches.some(
                yearBatch => yearBatch.examSessionYear === graduationYear
            );

        return matchesSearchQuery && matchesUserType && isInYearBatch;
    });

    // Ensure unique users
    const uniqueMembers = Array.from(
        new Map(filteredMembers.map(member => [member.id, member])).values()
    );

    const sortedMembers = uniqueMembers.sort((a, b) => {
        const nameA = a.displayName.toLowerCase();
        const nameB = b.displayName.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    const totalPages = Math.ceil((sortedMembers?.length ?? 0) / ITEMS_PER_PAGE);
    const currentItems = sortedMembers?.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const currentItemsCount = currentItems?.length ?? 0;
    const totalItemsCount = sortedMembers?.length ?? 0;

    if (peopleStore.error) return <div>Error: {peopleStore.error}</div>;

    return (
        <>
            <UserManagementDialog />
            <NewUserDialog />
            <div className="flex-1 h-full ml-3 flex flex-col justify-between p-6 bg-white border rounded-xl shadow-md">
                <div>
                    <ManagerialPageHeader
                        icon={<User size={16} />}
                        title={`Manage people at ${generalStore.userSchool?.name}`}
                        description="As an admin, you control the users in your school's BetterBac organization."
                        roundedButtonProps={{
                            onClick: () =>
                                peopleStore.setIsNewUserDialogOpen(true),
                        }}
                    />
                    <CustomDiv className="flex items-end justify-between">
                        <CustomDiv className="flex flex-col gap-4 mb-4">
                            <CustomDiv className="w-96">
                                <CustomTextInput
                                    type="text"
                                    placeholder={`Search people at ${generalStore.userSchool?.name}`}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </CustomDiv>
                        </CustomDiv>
                        <CustomDiv className="flex flex-col gap-4 mb-4">
                            <CustomDiv className="flex items-center gap-4">
                                {userType === "student" && (
                                    <CustomDiv className="flex flex-col gap-1 items-end">
                                        <CustomText className="text-xs text-gray-600">
                                            Year Batch
                                        </CustomText>
                                        <Select
                                            onValueChange={
                                                handleYearBatchFilterChange
                                            }
                                            defaultValue="all"
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Select graduation year" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        Any
                                                    </SelectItem>
                                                </SelectGroup>
                                                <SelectGroup>
                                                    {IB_ACTIVE_YEARS.map(
                                                        (year, idx) => {
                                                            return (
                                                                <SelectItem
                                                                    key={idx}
                                                                    value={year.toString()}
                                                                >
                                                                    {year}
                                                                </SelectItem>
                                                            );
                                                        }
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </CustomDiv>
                                )}
                                <CustomDiv className="flex flex-col gap-1 items-end">
                                    <CustomText className="text-xs text-gray-600">
                                        Filter
                                    </CustomText>
                                    <Select
                                        onValueChange={handleUserTypeChange}
                                        defaultValue="all"
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Select user type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectGroup>
                                                <SelectItem value="all">
                                                    Everyone
                                                </SelectItem>
                                                <SelectItem value="educator">
                                                    Educators
                                                </SelectItem>
                                                <SelectItem value="student">
                                                    Students
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </CustomDiv>
                            </CustomDiv>
                        </CustomDiv>
                    </CustomDiv>
                    <hr className="my-4" />
                    <div className="flex items-center justify-between px-8">
                        <CustomRoundedButton
                            onClick={() => handlePageChange(currentPage - 1)}
                            customIcon={<ChevronLeft size={12} />}
                            disabled={currentPage === 1}
                        />
                        <CustomRoundedButton
                            onClick={() => handlePageChange(currentPage + 1)}
                            customIcon={<ChevronRight size={12} />}
                            disabled={currentPage === totalPages}
                        />
                    </div>
                    <CustomDiv
                        className="flex-1 overflow-y-auto overflow-x-hidden pt-8 px-8"
                        style={{ maxHeight: "600px" }}
                    >
                        {currentItems && currentItems.length > 0 ? (
                            <ul className="grid grid-cols-2 gap-x-16 gap-y-4 w-full">
                                {currentItems.map(
                                    (person: IUser, idx: number) => (
                                        <MemberDisplay
                                            key={idx}
                                            {...person}
                                            generalOnClick={() =>
                                                peopleStore.setExpandedUser(
                                                    person
                                                )
                                            }
                                        />
                                    )
                                )}
                            </ul>
                        ) : (
                            <CustomDiv className="flex flex-col items-center justify-center gap-2 mt-4">
                                <SquirrelEmpty
                                    header="Oop! No people found."
                                    subHeader={
                                        searchQuery !== "" &&
                                        "Try adjusting your query for better results."
                                    }
                                />
                            </CustomDiv>
                        )}
                    </CustomDiv>
                </div>
                <div className="px-8 flex items-center justify-between text-gray-600 text-sm">
                    <CustomText>
                        Page <span className="font-bold">{currentPage}</span> of{" "}
                        <span className="font-bold">{totalPages}</span>
                    </CustomText>
                    <CustomText>
                        Showing{" "}
                        <span className="font-bold">{currentItemsCount}</span>{" "}
                        of <span className="font-bold">{totalItemsCount}</span>{" "}
                        people
                    </CustomText>
                </div>
            </div>
        </>
    );
});

export default People;
