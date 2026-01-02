import { useState, useEffect } from "react";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import { usePeopleStore } from "@BetterBac/state/Admin/People.store";
import { observer } from "mobx-react";
import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
} from "firebase/firestore";
import { ICourse, IUser } from "@BetterBac/lib/GlobalTypes";
import { AiOutlineClose } from "react-icons/ai"; // Import a close icon
import CustomText from "@BetterBac/components/common/CustomText";
import { ArrowLeft, BugPlay, Package2, Radio, Trash } from "lucide-react";
import { db } from "../../../../../../../config/firebase";
import { getCourseIconFromNumber } from "@BetterBac/lib/extraUtils/getCourseIconComponent";
import Pfp from "@BetterBac/components/common/Pfp/Pfp";
import CourseStrip from "./CourseStrip";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@BetterBac/components/common/Accordion";
import GeneralSpinnerLoader from "@BetterBac/components/common/GeneralSpinnerLoader";
import CustomIconWrapper from "@BetterBac/components/common/CustomIconWrapper";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import { getEducatorById } from "../UserManagementDialog";
import { outputFilteredUsersById } from "@BetterBac/lib/extraUtils/outputFilteredUsersById";

const AddToCourseView = () => {
    const generalStore = useGeneralStore();
    const peopleStore = usePeopleStore();
    const authStore = useAuthStore(); // Get auth store
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<ICourse[]>([]);
    const [stagingCourses, setStagingCourses] = useState<ICourse[]>([]); // Staging array for addition
    const [currentCourses, setCurrentCourses] = useState<ICourse[]>([]); // Current user courses
    const [initialCurrentCourses, setInitialCurrentCourses] = useState<
        ICourse[]
    >([]); // To revert to on cancel
    // const [educatorMap, setEducatorMap] = useState<Record<string, IUser>>({});
    const [educators, setEducators] = useState<IUser[]>([]);

    const [stagedTwo, setStagedTwo] = useState<ICourse[]>([]);

    const [loading, setLoading] = useState(true);

    const USER_FIRST_NAME = peopleStore.expandedUser?.displayName.split(" ")[0];

    const setEducatorsArray = async fetchedCourses => {
        const educatorIds = fetchedCourses.map(course => course.educatorId);
        const educatorUsers = outputFilteredUsersById({
            userArray: generalStore.userSchoolAllUsers,
            userIds: educatorIds,
        });
        setEducators(educatorUsers);
    };

    useEffect(() => {
        if (!generalStore.userSchool?.id) return;

        const coursesRef = collection(db, "courses");
        const q = query(
            coursesRef,
            where("linkedSchoolId", "==", generalStore.userSchool.id)
        );

        const unsubscribe = onSnapshot(q, snapshot => {
            const fetchedCourses: ICourse[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as ICourse[];

            // Apply filtering based on availability and search query
            const filteredByStudent = fetchedCourses.filter(
                course =>
                    !course.studentIds.includes(
                        peopleStore.expandedUser?.id ?? ""
                    )
            );

            setCourses(filteredByStudent);
            const filtered = filterCourses(filteredByStudent, searchQuery);
            setFilteredCourses(filtered);
            setEducatorsArray(fetchedCourses).then(() => setLoading(false));
        });

        return () => unsubscribe();
    }, [
        generalStore.userSchool?.id,
        searchQuery,
        peopleStore.expandedUser?.id,
        peopleStore.manageUserCoursesView,
    ]);

    useEffect(() => {
        if (!peopleStore.expandedUser?.id) return;

        // Initialize current courses
        setCurrentCourses(peopleStore.expandedUserCourses);
        setInitialCurrentCourses(peopleStore.expandedUserCourses);
    }, [peopleStore.expandedUser?.id, peopleStore.expandedUserCourses]);

    const filterCourses = (courses: ICourse[], query: string) => {
        if (!query)
            return courses.filter(
                course =>
                    !course.studentIds.includes(
                        peopleStore.expandedUser?.id ?? ""
                    )
            );
        return courses.filter(
            course =>
                (course.name.toLowerCase().includes(query.toLowerCase()) ||
                    course.description
                        .toLowerCase()
                        .includes(query.toLowerCase())) &&
                !course.studentIds.includes(peopleStore.expandedUser?.id ?? "")
        );
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const toggleCourseSelection = (course: ICourse) => {
        setStagingCourses(prevStagingCourses =>
            prevStagingCourses.some(c => c.id === course.id)
                ? prevStagingCourses.filter(c => c.id !== course.id)
                : [...prevStagingCourses, course]
        );
    };

    const handleRemoveCourse = (course: ICourse) => {
        setCurrentCourses(prevCurrentCourses =>
            prevCurrentCourses.filter(c => c.id !== course.id)
        );
        // setStagedTwo(prevStagedTwo => [...prevStagedTwo, course]);
        // setFilteredCourses(prevFilteredCourses => [
        //     ...prevFilteredCourses,
        //     course,
        // ]);
        setStagingCourses(prevStagingCourses =>
            prevStagingCourses.filter(c => c.id !== course.id)
        );
    };

    const handleSaveChanges = async () => {
        if (!peopleStore.expandedUser?.id) return;

        const db = getFirestore();

        try {
            // Update additions
            await Promise.all(
                stagingCourses.map(async course => {
                    const courseRef = doc(db, "courses", course.id);
                    await updateDoc(courseRef, {
                        studentIds: [
                            ...(course.studentIds || []),
                            peopleStore.expandedUser.id,
                        ],
                    });
                })
            );

            // Update removals
            await Promise.all(
                initialCurrentCourses.map(async course => {
                    if (!currentCourses.some(c => c.id === course.id)) {
                        const courseRef = doc(db, "courses", course.id);
                        await updateDoc(courseRef, {
                            studentIds: (course.studentIds || []).filter(
                                studentId =>
                                    studentId !== peopleStore.expandedUser.id
                            ),
                        });
                    }
                })
            );

            // Update local state to reflect changes
            peopleStore.setManageUserCoursesView(false);
            peopleStore.setUserEditMode(false);
            setStagingCourses([]); // Clear staging courses after saving
            setCurrentCourses(initialCurrentCourses); // Reset current courses to initial state
        } catch (error) {
            console.error("Error updating courses:", error);
        }
    };

    const handleCancelChanges = () => {
        // Reset local state to the initial values
        setStagingCourses([]);
        if (stagedTwo.length > 0) {
            setFilteredCourses(stagedTwo);
        }

        setStagedTwo([]);
        setCurrentCourses(initialCurrentCourses);
    };

    if (loading) {
        return <GeneralSpinnerLoader />;
    }

    return (
        <CustomDiv className="flex flex-col">
            <div
                onClick={() => peopleStore.setManageUserCoursesView(false)}
                className="flex items-center gap-1 w-max text-gray-600 hover:opacity-50 cursor-pointer transition-transform transform hover:scale-[1.02] mb-2"
            >
                <ArrowLeft size={14} />
                <CustomText className="text-sm">Back</CustomText>
            </div>
            <CustomDiv>
                <CustomText className="text-xl font-bold">
                    Edit {USER_FIRST_NAME}
                    's courses
                </CustomText>
                <CustomText className="text-sm text-gray-600">
                    Although teachers can manage their students, you have the
                    final say as a system admin.
                </CustomText>
            </CustomDiv>
            <Accordion type="single" collapsible>
                <AccordionItem value="activeCourses">
                    <AccordionTrigger>
                        <CustomDiv className="flex flex-col items-start justify-start gap-0.5">
                            <CustomDiv className="flex items-center gap-2">
                                <CustomIconWrapper>
                                    <Radio size={16} />
                                </CustomIconWrapper>
                                <CustomText className="text-lg font-semibold">
                                    {USER_FIRST_NAME}'s active courses (YEAR
                                    BATCH NAME - active)
                                </CustomText>
                            </CustomDiv>
                            <CustomText className="text-sm text-gray-600">
                                Don't worry, removing a course will not delete{" "}
                                {USER_FIRST_NAME}'s work if they're added back
                                later.
                            </CustomText>
                        </CustomDiv>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        {currentCourses.length === 0 ? (
                            <p className="italic">
                                This person is not currently a member of any
                                active courses! Reference the school's course
                                repository below to select courses to add them
                                to.
                            </p>
                        ) : (
                            <CustomDiv className="space-y-2 px-4">
                                {currentCourses.map((course, idx) => {
                                    const educator = educators.find(
                                        educator =>
                                            educator.id === course.educatorId
                                    );
                                    return (
                                        <CourseStrip
                                            key={idx}
                                            course={course}
                                            educator={educator}
                                            rightChild={
                                                <div
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleRemoveCourse(
                                                            course
                                                        );
                                                        // if (file.handleDeleteAfterTurnIn) {
                                                        //     file.handleDeleteAfterTurnIn(file.name);
                                                        // } else {
                                                        //     file.handleDeleteBeforeTurnIn(file.name);
                                                        // }
                                                    }}
                                                    className="flex items-center justify-center cursor-pointer"
                                                >
                                                    <Trash
                                                        // className="text-red-500 hover:text-red-700 ml-2"
                                                        size={14}
                                                        className="text-gray-600 hover:text-gray-900 mr-2"
                                                    >
                                                        Delete
                                                    </Trash>
                                                </div>
                                            }
                                        />
                                    );
                                })}
                            </CustomDiv>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <CustomDiv className="flex flex-col gap-4 mt-4">
                <Accordion type="single" collapsible>
                    <AccordionItem value="courseRepo">
                        <AccordionTrigger>
                            <CustomDiv className="flex items-center gap-2">
                                <CustomDiv className="leading-[0.25rem] space-y-0.5">
                                    <CustomDiv className="flex items-center gap-2">
                                        <CustomIconWrapper>
                                            <Package2 size={16} />
                                        </CustomIconWrapper>
                                        <CustomText className="text-lg font-semibold">
                                            {generalStore.userSchool?.name}{" "}
                                            course repository
                                        </CustomText>
                                    </CustomDiv>

                                    <CustomText className="text-sm text-gray-600">
                                        Click on a course to add it to{" "}
                                        {USER_FIRST_NAME}'s active courses.
                                    </CustomText>
                                </CustomDiv>
                            </CustomDiv>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            <CustomDiv className="w-96">
                                <CustomTextInput
                                    type="text"
                                    placeholder={`Search courses`}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </CustomDiv>
                            <CustomDiv className="space-y-2">
                                {filteredCourses.length === 0 ? (
                                    <p className="italic">
                                        There are no courses within this
                                        organization this user is not a member
                                        of.
                                    </p>
                                ) : (
                                    <CustomDiv className="px-4 space-y-2">
                                        {filteredCourses.map(course => {
                                            const educator = educators.find(
                                                educator =>
                                                    educator.id ===
                                                    course.educatorId
                                            );
                                            return (
                                                <CourseStrip
                                                    key={course.id}
                                                    course={course}
                                                    educator={educator}
                                                    addedClassName={`${
                                                        stagingCourses.some(
                                                            c =>
                                                                c.id ===
                                                                course.id
                                                        )
                                                            ? "bg-gray-200"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        toggleCourseSelection(
                                                            course
                                                        )
                                                    }
                                                    rightChild={
                                                        <>
                                                            {stagingCourses.some(
                                                                c =>
                                                                    c.id ===
                                                                    course.id
                                                            ) && (
                                                                <CustomDiv className="absolute top-2 right-2 cursor-pointer">
                                                                    <AiOutlineClose
                                                                        className="text-gray-600 hover:text-gray-900"
                                                                        onClick={e => {
                                                                            e.stopPropagation(); // Prevent triggering the course click handler
                                                                            toggleCourseSelection(
                                                                                course
                                                                            );
                                                                        }}
                                                                    />
                                                                </CustomDiv>
                                                            )}
                                                        </>
                                                    }
                                                />
                                            );
                                        })}
                                    </CustomDiv>
                                )}
                            </CustomDiv>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                {(stagingCourses.length > 0 ||
                    currentCourses.length < initialCurrentCourses.length) && (
                    <CustomDiv className="flex gap-2 mt-4 items-center justify-end">
                        <CustomButton
                            isInverse
                            onClick={handleCancelChanges}
                            addedClassname="text-xs"
                        >
                            Cancel
                        </CustomButton>
                        <CustomButton
                            onClick={handleSaveChanges}
                            addedClassname="text-xs"
                        >
                            Save Changes
                        </CustomButton>
                    </CustomDiv>
                )}
            </CustomDiv>
        </CustomDiv>
    );
};

export default observer(AddToCourseView);
