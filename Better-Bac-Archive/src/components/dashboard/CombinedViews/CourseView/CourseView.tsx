import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import CustomText from "@BetterBac/components/common/CustomText";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import { getIBDPYear } from "@BetterBac/lib/extraUtils/getIBDPYear.util";
import CleoBlurb from "./PrimaryWidget/CleoBlurb";
import DotPattern from "@BetterBac/components/common/DotPattern/DotPattern";
import AvatarCircles from "@BetterBac/components/common/AvatarCircles/AvatarCircles";
import {
    ActiveCourseDashboardState,
    IAssignmentInstance,
    IUser,
} from "@BetterBac/lib/GlobalTypes";
import {
    collection,
    query,
    where,
    onSnapshot,
    DocumentData,
    addDoc,
    getDocs,
    doc,
    writeBatch,
} from "firebase/firestore";
import { db } from "../../../../../config/firebase";
import OrbitingLoader from "@BetterBac/components/common/OrbitingLoader";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { getCourseIconFromNumber } from "@BetterBac/lib/extraUtils/getCourseIconComponent";
import Home from "./Home/Home";
import Assignments from "./Assignments/Assignments";
import ClassDirectory from "./ClassDirectory";
import ExpandedAssignment from "./ExpandedAssignment";
import Grades from "./Grades/Grades";
import Files from "./Files";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import NoCourses from "./NoCourses";
import GradeBoundaries from "./GradeBoundaries";
import SubNavbar from "../../../common/SubNavbar";
import { outputFilteredUsersById } from "@BetterBac/lib/extraUtils/outputFilteredUsersById";

const CourseView = () => {
    const generalStore = useGeneralStore();
    const [courseLevel, setCourseLevel] = useState("");
    const [avatarUsers, setAvatarUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const authStore = useAuthStore();
    const [doneSettingCourses, setDoneSettingCourses] = useState(false);

    useEffect(() => {
        if (generalStore.allAssignments) {
            generalStore.setActiveCourseAssignments(
                generalStore.allAssignments.filter(
                    assignment =>
                        assignment.linkedCourseId ===
                        generalStore.activeCourse?.id
                )
            );

            setDoneSettingCourses(true);
        }
    }, [generalStore.allAssignments, generalStore.activeCourse]);

    const fetchAssignmentInstances = async () => {
        if (!generalStore.activeCourse?.id || !authStore.user.id) return;

        setLoading(true);
        setError(null);
        const assignmentInstancesArr: IAssignmentInstance[] = [];

        try {
            const assignments = generalStore.activeCourseAssignments;
            const assignmentInstancesCollection = collection(
                db,
                "assignment_instances"
            );

            // Collect all assignments that need to be checked/created
            const assignmentsToCreate: IAssignmentInstance[] = [];
            const existingAssignmentsPromises = assignments.map(
                async assignment => {
                    const q = query(
                        assignmentInstancesCollection,
                        where("linkedAssignmentId", "==", assignment.id),
                        where("linkedStudentId", "==", authStore.user.id)
                    );

                    // Fetch the documents
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        // If the document exists, add it to the array
                        querySnapshot.forEach(doc => {
                            const data = doc.data() as IAssignmentInstance;
                            assignmentInstancesArr.push({
                                id: doc.id,
                                linkedAssignmentId: data.linkedAssignmentId,
                                linkedStudentId: data.linkedStudentId,
                                marksObtained: data.marksObtained,
                                dateSubmitted: data.dateSubmitted,
                                isSubmitted: data.isSubmitted,
                            });
                        });
                    } else {
                        // If no document exists, prepare to create a new instance
                        assignmentsToCreate.push({
                            id: "",
                            linkedAssignmentId: assignment.id,
                            linkedStudentId: authStore.user.id,
                            isSubmitted: false,
                        });
                    }
                }
            );

            await Promise.all(existingAssignmentsPromises);

            // Create all new instances in a batch
            const batch = writeBatch(db);
            const assignmentInstancesCollectionRef = collection(
                db,
                "assignment_instances"
            );

            assignmentsToCreate.forEach(newInstance => {
                const docRef = doc(assignmentInstancesCollectionRef);
                newInstance.id = docRef.id;
                batch.set(docRef, newInstance);
            });

            await batch.commit();

            // Add newly created instances to the state
            generalStore.setActiveCourseAssignmentInstances([
                ...assignmentInstancesArr,
                ...assignmentsToCreate,
            ]);
        } catch (err) {
            console.error(
                "Failed to fetch or create assignment instances:",
                err
            );
            setError("Failed to fetch or create assignment instances.");
        } finally {
            setLoading(false);
            setDoneSettingCourses(false);
        }
    };

    useEffect(() => {
        if (doneSettingCourses) fetchAssignmentInstances();
    }, [doneSettingCourses, generalStore.activeCourse]);

    useEffect(() => {
        setCourseLevel(generalStore.activeCourse?.isHL ? "HL" : "SL");
    }, [generalStore.activeCourse]);

    useEffect(() => {
        const courseStudents = outputFilteredUsersById({
            userArray: generalStore.userSchoolAllUsers,
            userIds: generalStore.activeCourse?.studentIds || [],
        });
        const selectedUsers = courseStudents
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
        setAvatarUsers(selectedUsers);
    }, [generalStore.activeCourse?.studentIds]);

    if (authStore.globalLoading || loading) {
        return (
            <div className="flex flex-1">
                <OrbitingLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <CustomText className="text-red-500">{error}</CustomText>
            </div>
        );
    }

    const CourseIcon = getCourseIconFromNumber(
        generalStore.activeCourse?.iconNumber || 0
    );

    const bodyRenderer = () => {
        switch (generalStore.activeCourseDashboardState) {
            case ActiveCourseDashboardState.HOME:
                return <Home />;
            case ActiveCourseDashboardState.ASSIGNMENTS:
                return <Assignments />;
            case ActiveCourseDashboardState.GRADES:
                return <Grades />;
            case ActiveCourseDashboardState.FILE_REPO:
                return <Files />;
            case ActiveCourseDashboardState.CLASS_DIRECTORY:
                return <ClassDirectory />;
            case ActiveCourseDashboardState.GRADE_BOUNDARIES:
                return <GradeBoundaries />;
        }
    };

    return (
        <>
            {generalStore.userCourses?.length === 0 ||
            !generalStore.userCourses ? (
                <NoCourses />
            ) : (
                <>
                    {generalStore.expandedAssignment ? (
                        <ExpandedAssignment />
                    ) : (
                        <div className={`flex flex-col flex-1 h-full`}>
                            {/* Top half-height widget */}
                            <div className="ml-3 mb-3 px-6 py-4 bg-white border rounded-xl relative overflow-clip shadow-md flex-0.5 min-h-[325px] flex flex-col justify-between">
                                <DotPattern className="absolute inset-0 z-0" />
                                <div className="relative z-10">
                                    <SubNavbar />
                                </div>
                                <div className="relative flex flex-col items-center gap-4 mt-4">
                                    <CustomDiv
                                        className={`bg-white shadow-md border-[3px] p-3 rounded-xl`}
                                        style={{
                                            borderColor:
                                                generalStore.activeCourse
                                                    ?.courseColor,
                                        }} //TODO: Add proper accent color from backend to border
                                    >
                                        <CourseIcon size={40} />
                                    </CustomDiv>
                                    <div className="text-center flex flex-col gap-1">
                                        <CustomText className="text-2xl font-bold">
                                            IBDP{" "}
                                            {generalStore.activeCourse?.name}{" "}
                                            {courseLevel} {getIBDPYear(2026)}
                                        </CustomText>
                                        <CustomText className="text-gray-600">
                                            {
                                                generalStore.activeCourse
                                                    ?.description
                                            }
                                        </CustomText>
                                    </div>
                                </div>
                                <div className="relative w-full flex items-center justify-between mt-4">
                                    <CleoBlurb />
                                    <AvatarCircles
                                        users={avatarUsers}
                                        numPeople={
                                            generalStore.activeCourse
                                                ?.studentIds.length || null
                                        }
                                        onClick={() =>
                                            generalStore.setActiveCourseDashboardState(
                                                ActiveCourseDashboardState.CLASS_DIRECTORY
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Bottom half-height widget */}
                            <div className="flex-1 mt-2 ml-3 rounded-xl relative overflow-clip shadow-md">
                                {/* <DotPattern className="absolute inset-0 z-0" /> */}
                                {bodyRenderer()}
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default observer(CourseView);
