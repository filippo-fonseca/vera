import { useEffect, useState } from "react";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@BetterBac/components/common/Dialog";
import { useGeneralStore } from "@BetterBac/state/General.store";
import Pfp from "@BetterBac/components/common/Pfp/Pfp";
import { usePeopleStore } from "@BetterBac/state/Admin/People.store";
import { observer } from "mobx-react";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    arrayRemove,
} from "firebase/firestore";
import { ICourse, IUser, IYearBatch, Tabs } from "@BetterBac/lib/GlobalTypes";
import { db } from "../../../../../../config/firebase";
import { getCourseIconFromNumber } from "@BetterBac/lib/extraUtils/getCourseIconComponent";
import { truncate } from "@BetterBac/lib/utils";
import { CircleX, Pencil } from "lucide-react";
import CustomPlusButton from "@BetterBac/components/common/CustomRoundedButton";
import AddToCourseView from "./AddToCourseView/AddToCourseView";
import { useYearBatchesStore } from "@BetterBac/state/Admin/YearBatches.store";
import { outputFilteredUsersById } from "@BetterBac/lib/extraUtils/outputFilteredUsersById";

const fetchCoursesForStudent = async (
    studentId: string
): Promise<ICourse[]> => {
    const coursesRef = collection(db, "courses");
    const q = query(
        coursesRef,
        where("studentIds", "array-contains", studentId)
    );

    try {
        const querySnapshot = await getDocs(q);
        const courses: ICourse[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as ICourse), // Type assertion to ICourse
        }));
        return courses;
    } catch (error) {
        console.error("Error fetching courses:", error);
        return []; // Return an empty array in case of an error
    }
};

export const getEducatorById = async (
    allSchoolUsers: IUser[],
    educatorId: string
): Promise<IUser | null> => {
    const total = outputFilteredUsersById({
        userArray: allSchoolUsers,
        userIds: [educatorId],
    });
    if (total.length < 0) console.error("The educator does not exist.");

    return total.length > 0 ? total[0] : null;
};

const UserManagementDialog = () => {
    const yearBatchesStore = useYearBatchesStore();
    const generalStore = useGeneralStore();
    const peopleStore = usePeopleStore();
    const [tempCoursesToRemove, setTempCoursesToRemove] = useState<string[]>(
        []
    );
    const [educatorMap, setEducatorMap] = useState<Record<string, IUser>>({});
    const [userDetails, setUserDetails] = useState<{
        displayName: string;
        email: string;
        graduationYear?: number;
    }>({
        displayName: "",
        email: "",
        graduationYear: undefined,
    });
    const [initialUserDetails, setInitialUserDetails] = useState<
        typeof userDetails | null
    >(null);
    const [initialCourses, setInitialCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);

    const [userYearBatches, setUserYearBatches] = useState<IYearBatch[]>([]);

    const fetchYearBatchesForStudent = async (
        studentId: string
    ): Promise<IYearBatch[]> => {
        const yearBatchesRef = collection(db, "year_batches");
        const q = query(
            yearBatchesRef,
            where("linkedSchoolId", "==", generalStore.userSchool?.id)
        );

        try {
            const querySnapshot = await getDocs(q);
            const yearBatches: IYearBatch[] = querySnapshot.docs
                .map(doc => {
                    const data = doc.data() as IYearBatch;
                    if (data.studentIds && Array.isArray(data.studentIds)) {
                        // Check if studentId is included in studentIds array
                        if (data.studentIds.includes(studentId)) {
                            return data; // Return the whole year batch object
                        }
                    }
                    return null;
                })
                .filter(batch => batch !== null) as IYearBatch[]; // Filter out null values
            return yearBatches;
        } catch (error) {
            console.error("Error fetching year batches:", error);
            return []; // Return an empty array in case of an error
        }
    };

    useEffect(() => {
        if (!peopleStore.userEditMode) {
            setLoading(true);
            setTempCoursesToRemove([]);
            fetchCoursesForStudent(peopleStore.expandedUser?.id).then(
                fetchedCourses => {
                    peopleStore.setExpandedUserCourses(fetchedCourses);
                    setInitialCourses(fetchedCourses); // Save initial courses
                    setLoading(false);
                }
            );
        }
    }, [peopleStore.userEditMode]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (peopleStore.expandedUser) {
                const studentId = peopleStore.expandedUser.id;
                const fetchedCourses = await fetchCoursesForStudent(studentId);
                peopleStore.setExpandedUserCourses(fetchedCourses);
                setInitialCourses(fetchedCourses); // Save initial courses

                const educatorPromises = fetchedCourses.map(async course => {
                    if (course.educatorId) {
                        const educator = await getEducatorById(
                            generalStore.userSchoolAllUsers,
                            course.educatorId
                        );
                        if (educator) {
                            return { [course.educatorId]: educator };
                        }
                    }
                    return null;
                });

                const educatorArray = await Promise.all(educatorPromises);
                const educatorObj = educatorArray.reduce((acc, cur) => {
                    if (cur) {
                        return { ...acc, ...cur };
                    }
                    return acc;
                }, {} as Record<string, IUser>);

                setEducatorMap(educatorObj);
            }
        };

        fetchCourses().then(() =>
            fetchYearBatchesForStudent(peopleStore.expandedUser?.id).then(
                fetchedBatches => {
                    setUserYearBatches(fetchedBatches);
                    setLoading(false);
                }
            )
        );
    }, [peopleStore.expandedUser, peopleStore.manageUserCoursesView]);

    useEffect(() => {
        if (peopleStore.expandedUser) {
            const initialData = {
                displayName: peopleStore.expandedUser.displayName || "",
                email: peopleStore.expandedUser.email || "",
            };
            setUserDetails(initialData);
            setInitialUserDetails(initialData); // Save initial user details
        }
    }, [peopleStore.expandedUser]);

    // Existing functions...

    const handleCancel = () => {
        if (initialUserDetails) {
            setUserDetails(initialUserDetails); // Restore initial user details
        }
        peopleStore.setExpandedUserCourses(initialCourses); // Restore initial courses
        setTempCoursesToRemove([]); // Clear temp courses to remove
        peopleStore.setUserEditMode(false); // Exit edit mode
    };

    const handleCourseRemoval = async (courseId: string) => {
        if (peopleStore.expandedUser) {
            const courseRef = doc(db, "courses", courseId);
            try {
                await updateDoc(courseRef, {
                    studentIds: arrayRemove(peopleStore.expandedUser.id),
                });
                // Remove course from local state
                peopleStore.setExpandedUserCourses(
                    peopleStore.expandedUserCourses.filter(
                        course => course.id !== courseId
                    )
                );
                peopleStore.setUserEditMode(false);
            } catch (error) {
                console.error("Error removing course:", error);
            }
        }
    };

    const handleSave = async () => {
        if (peopleStore.expandedUser) {
            const userRef = doc(db, "users", peopleStore.expandedUser.id);
            try {
                await updateDoc(userRef, {
                    displayName: userDetails.displayName,
                    email: userDetails.email,
                    graduationYear: userDetails.graduationYear,
                });
                peopleStore.setExpandedUser({
                    ...peopleStore.expandedUser,
                    displayName: userDetails.displayName,
                    email: userDetails.email,
                });
                if (tempCoursesToRemove.length > 0) {
                    tempCoursesToRemove.forEach(courseId =>
                        handleCourseRemoval(courseId)
                    );
                } else {
                    peopleStore.setUserEditMode(false);
                }
            } catch (error) {
                console.error("Error updating user:", error);
            }
        }
    };

    const isStudent = !peopleStore.expandedUser?.isEducator;

    return (
        <Dialog
            open={peopleStore.expandedUser !== null}
            onOpenChange={() => {
                if (peopleStore.expandedUser) {
                    peopleStore.setExpandedUser(null);
                    peopleStore.setUserEditMode(false);
                    setLoading(true);
                    peopleStore.setExpandedUserCourses([]);
                    peopleStore.setManageUserCoursesView(false);
                }
            }}
        >
            <DialogContent className="min-w-[650px] min-h-[600px] bg-white">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {peopleStore.manageUserCoursesView ? (
                            <AddToCourseView />
                        ) : (
                            <>
                                <div>
                                    <div
                                        className={`relative flex ${
                                            peopleStore.userEditMode &&
                                            "flex-col"
                                        } gap-4 mt-4`}
                                    >
                                        <Pfp
                                            customUser={
                                                peopleStore.expandedUser
                                            }
                                            size="size-12"
                                        />
                                        <div className="flex flex-col gap-1 w-full">
                                            {peopleStore.userEditMode ? (
                                                <div className="flex flex-col text-left w-full gap-4">
                                                    <div className="w-full">
                                                        <label className="block mb-2 text-sm font-medium">
                                                            <CustomText>
                                                                Display Name
                                                            </CustomText>
                                                        </label>
                                                        <CustomTextInput
                                                            value={
                                                                userDetails.displayName
                                                            }
                                                            onChange={e =>
                                                                setUserDetails(
                                                                    prev => ({
                                                                        ...prev,
                                                                        displayName:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            placeholder="Display Name"
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className="block mb-2 text-sm font-medium">
                                                            <CustomText>
                                                                Email
                                                            </CustomText>
                                                        </label>
                                                        <CustomTextInput
                                                            value={
                                                                userDetails.email
                                                            }
                                                            onChange={e =>
                                                                setUserDetails(
                                                                    prev => ({
                                                                        ...prev,
                                                                        email: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                )
                                                            }
                                                            placeholder="Email"
                                                        />
                                                    </div>
                                                    {isStudent && (
                                                        <div>
                                                            <CustomText className="text-gray-600 text-sm mt-6">
                                                                You can edit the
                                                                year batches
                                                                this student is
                                                                a part of in the{" "}
                                                                <i>
                                                                    Year Batches
                                                                </i>{" "}
                                                                page.
                                                            </CustomText>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="leading-[0.5rem]">
                                                        <CustomText className="text-xl font-bold">
                                                            {
                                                                peopleStore
                                                                    .expandedUser
                                                                    ?.displayName
                                                            }
                                                        </CustomText>
                                                        <CustomText className="text-gray-600 text-sm">
                                                            {
                                                                peopleStore
                                                                    .expandedUser
                                                                    ?.email
                                                            }
                                                        </CustomText>
                                                    </div>
                                                    {isStudent && (
                                                        <div className="flex items-center gap-2">
                                                            {userYearBatches.map(
                                                                (
                                                                    batch,
                                                                    idx
                                                                ) => {
                                                                    return (
                                                                        <CustomDiv
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="flex items-center border shadow-md px-1.5 h-6 rounded-lg w-max cursor-pointer hover:text-white hover:bg-black transition-transform transform hover:scale-[1.02]"
                                                                            onClick={() => {
                                                                                yearBatchesStore.setCurrentYearBatch(
                                                                                    batch
                                                                                );
                                                                                yearBatchesStore.setIsYearBatchDialogOpen(
                                                                                    true
                                                                                );
                                                                                generalStore.setCurrentTab(
                                                                                    Tabs.YEAR_BATCHES
                                                                                );
                                                                                peopleStore.setExpandedUser(
                                                                                    null
                                                                                );
                                                                            }}
                                                                        >
                                                                            <CustomText className="text-xs font-semibold">
                                                                                {
                                                                                    batch.name
                                                                                }
                                                                            </CustomText>
                                                                        </CustomDiv>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <hr className="mb-2" />
                                <CustomDiv className="flex items-center justify-between">
                                    <CustomText className="font-medium">
                                        Current courses
                                    </CustomText>
                                    {peopleStore.userEditMode && (
                                        <CustomPlusButton
                                            customIcon={<Pencil size={12} />}
                                            onClick={() =>
                                                peopleStore.setManageUserCoursesView(
                                                    true
                                                )
                                            }
                                        />
                                    )}
                                </CustomDiv>
                                <div>
                                    {peopleStore.expandedUserCourses?.length >
                                    0 ? (
                                        <div className="list flex gap-4">
                                            {peopleStore.expandedUserCourses.map(
                                                course => {
                                                    const CourseIcon =
                                                        getCourseIconFromNumber(
                                                            course.iconNumber
                                                        );
                                                    const educator =
                                                        educatorMap[
                                                            course.educatorId ||
                                                                ""
                                                        ];

                                                    return (
                                                        <div
                                                            key={course.id}
                                                            className="flex flex-col items-center gap-3 border shadow-md min-w-[150px] py-3 rounded-xl cursor-pointer transition-transform transform hover:scale-[1.04]"
                                                        >
                                                            <CustomDiv
                                                                className={`bg-white shadow-md border-[3px] p-3 rounded-xl`}
                                                                style={{
                                                                    borderColor:
                                                                        course.courseColor,
                                                                }} //TODO: Add proper accent color from backend to border
                                                            >
                                                                <CourseIcon className="w-8 h-8" />
                                                            </CustomDiv>
                                                            <CustomText className="font-bold text-center">
                                                                {course.name}
                                                            </CustomText>
                                                            <CustomDiv className="flex items-center justify-center gap-1">
                                                                {educator ? (
                                                                    <Pfp
                                                                        customUser={
                                                                            educator
                                                                        }
                                                                        size="size-5"
                                                                        customTextSize="text-[7.5px]"
                                                                    />
                                                                ) : (
                                                                    <CustomText className="text-gray-600 text-sm">
                                                                        Educator
                                                                        not
                                                                        found
                                                                    </CustomText>
                                                                )}
                                                                <CustomText className="text-gray-600 text-sm">
                                                                    {truncate(
                                                                        educator
                                                                            ? educator.displayName
                                                                            : "Educator not found",
                                                                        12
                                                                    )}
                                                                </CustomText>
                                                            </CustomDiv>
                                                            {/* {peopleStore.userEditMode && (
                                                            <CircleX
                                                                className="w-5 h-5 cursor-pointer hover:opacity-50"
                                                                onClick={() => {
                                                                    peopleStore.setExpandedUserCourses(
                                                                        prevItems =>
                                                                            prevItems.filter(
                                                                                item =>
                                                                                    item !==
                                                                                    course
                                                                            )
                                                                    );
                                                                    setTempCoursesToRemove(
                                                                        prev => [
                                                                            ...prev,
                                                                            course.id,
                                                                        ]
                                                                    );
                                                                }}
                                                            />
                                                        )} */}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    ) : (
                                        <CustomText>
                                            No courses found
                                        </CustomText>
                                    )}
                                </div>
                                <hr className="my-2" />
                                <CustomText className="font-medium">
                                    Report card log
                                </CustomText>
                                <DialogFooter>
                                    {peopleStore.userEditMode ? (
                                        <>
                                            <CustomButton
                                                isInverse
                                                onClick={handleCancel}
                                                addedClassname="text-xs"
                                            >
                                                Cancel
                                            </CustomButton>
                                            <CustomButton
                                                onClick={handleSave}
                                                addedClassname="text-xs"
                                            >
                                                Save Changes
                                            </CustomButton>
                                        </>
                                    ) : (
                                        <CustomButton
                                            onClick={() =>
                                                peopleStore.setUserEditMode(
                                                    true
                                                )
                                            }
                                        >
                                            Edit{" "}
                                            {isStudent ? "student" : "educator"}
                                        </CustomButton>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default observer(UserManagementDialog);
