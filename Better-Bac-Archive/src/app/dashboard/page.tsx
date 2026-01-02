"use client";

import { useAuthStore } from "@BetterBac/state/Auth.store";
import { onAuthStateChanged } from "firebase/auth";
import {
    query,
    collection,
    where,
    onSnapshot,
    getDocs,
    DocumentData,
} from "firebase/firestore";
import { observer } from "mobx-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import OrbitingLoader from "@BetterBac/components/common/OrbitingLoader";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomText from "@BetterBac/components/common/CustomText";
import { FaUser, FaCog, FaHome } from "react-icons/fa";

import CASIcon from "../icons/IBElementIcons/CAS.icon";
import { auth, db } from "../../../config/firebase";
import LogoAppIcon from "../icons/Brand/LogoApp.icon";
import { Bell, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import { useGeneralStore } from "@BetterBac/state/General.store";
import {
    IAssignment,
    ICourse,
    IUser,
    IYearBatch,
    Tabs,
} from "@BetterBac/lib/GlobalTypes";
import LifeOS from "@BetterBac/components/dashboard/CombinedViews/LifeOS";
import Sidebar from "@BetterBac/components/dashboard/Sidebar/Sidebar";
import CourseView from "@BetterBac/components/dashboard/CombinedViews/CourseView";
import Pfp from "@BetterBac/components/common/Pfp/Pfp";
import School from "@BetterBac/components/dashboard/CombinedViews/School";
import People from "@BetterBac/components/dashboard/CombinedViews/People";
import YearBatches from "@BetterBac/components/dashboard/CombinedViews/YearBatches";
import Toast from "@BetterBac/components/common/Toast";
import { usePeopleStore } from "@BetterBac/state/Admin/People.store";
import JoinCourseDialog from "@BetterBac/components/dashboard/CombinedViews/CourseView/JoinCourseDialog";
import { useJoinCourseStore } from "@BetterBac/state/CourseView/JoinCourse.store";
import CustomPlusButton from "@BetterBac/components/common/CustomRoundedButton";
import { useYearBatchesStore } from "@BetterBac/state/Admin/YearBatches.store";

const Dashboard: React.FC = () => {
    const authStore = useAuthStore();
    const joinCourseStore = useJoinCourseStore();
    const yearBatchesStore = useYearBatchesStore();

    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // State for dropdown
    const [hoverLogos, setHoverLogos] = useState<boolean>(true);
    const generalStore = useGeneralStore();

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                // User is signed in.
                const q = query(
                    collection(db, "users"),
                    where("id", "==", user.uid)
                );
                onSnapshot(q, querySnapshot => {
                    const fetched = [];

                    querySnapshot.forEach(documentSnapshot => {
                        fetched.push({
                            ...documentSnapshot.data(),
                            key: documentSnapshot.id,
                        });
                    });

                    authStore.setUser({
                        id: fetched[0].id as string,
                        displayName: fetched[0].displayName as string,
                        email: fetched[0].email as string,
                        isEducator: fetched[0].isEducator as boolean,
                        photoURL: fetched[0].photoURL as string,
                        linkedSchoolId: fetched[0].linkedSchoolId as string,
                    });
                });
            } else {
                // User is signed out.
                authStore.setUser(null);
                router.push("/");
            }
        });

        // Clean up the listener on unmount
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        setTimeout(() => {
            setHoverLogos(false);
        }, 4000);
    }, []);

    const fetchSchoolFromDb = async () => {
        try {
            const q = query(
                collection(db, "schools"),
                where("id", "==", authStore.user?.linkedSchoolId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const fetched = [];
                querySnapshot.forEach(doc => {
                    fetched.push({
                        id: doc.id,
                        ...(doc.data() as DocumentData),
                    });
                });

                generalStore.setUserSchool({
                    id: fetched[0].id,
                    name: fetched[0].name,
                    addressObj: fetched[0].addressObj,
                    timezone: fetched[0].timezone,
                    phone: fetched[0].phone,
                    photoURL: fetched[0].photoURL,
                    adminAccessUserIds: fetched[0].adminAccessUserIds,
                    schoolYearStartMonth: fetched[0].schoolYearStartMonth,
                    schoolYearEndMonth: fetched[0].schoolYearEndMonth,
                    domain: fetched[0].domain,
                });
            } else {
                console.log("No matching documents.");
            }
        } catch (error: any) {
            console.error("Error fetching school:", error);
        }
    };

    const fetchSchoolUsersFromDB = async () => {
        try {
            const q = query(
                collection(db, "users"),
                where("linkedSchoolId", "==", authStore.user?.linkedSchoolId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const fetched = [];
                querySnapshot.forEach(doc => {
                    fetched.push({
                        id: doc.id,
                        ...(doc.data() as DocumentData),
                    } as IUser);
                });

                generalStore.setUserSchoolAllUsers(fetched);
            } else {
                console.log("No matching documents.");
            }
        } catch (error: any) {
            console.error("Error fetching school users:", error);
        }
    };

    const fetchCoursesFromDb = async () => {
        try {
            const q = query(
                collection(db, "courses"),
                where("studentIds", "array-contains", authStore.user?.id)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const fetched = [];
                querySnapshot.forEach(doc => {
                    fetched.push({
                        id: doc.id,
                        ...(doc.data() as DocumentData),
                    } as ICourse);
                });

                generalStore.setUserCourses(fetched);
            } else {
                console.log("No matching documents.");
            }
        } catch (error: any) {
            console.error("Error fetching courses:", error);
        }
    };

    const subscribeToAssignments = () => {
        const allAssignmentListeners = generalStore.userCourses?.map(course => {
            const q = query(collection(db, "assignments"));

            return onSnapshot(q, querySnapshot => {
                const fetchedAssignments: IAssignment[] = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data() as DocumentData;
                    fetchedAssignments.push({
                        id: doc.id,
                        title: data.title,
                        description: data.description,
                        dueDate: data.dueDate,
                        totalMarks: data.totalMarks,
                        requiresSubmission: data.requiresSubmission,
                        linkedCourseId: data.linkedCourseId,
                    });
                });
                generalStore.setAllAssignments(fetchedAssignments);
                authStore.setGlobalLoading(false);
                console.log("Assignments updated:", fetchedAssignments);
            });
        });

        // Cleanup listeners on component unmount
        return () => {
            allAssignmentListeners?.forEach(unsubscribe => unsubscribe());
        };
    };

    useEffect(() => {
        const unsubscribe = subscribeToAssignments();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [generalStore.userCourses]);

    useEffect(() => {
        if (authStore.user) {
            fetchSchoolFromDb().then(() => {
                fetchSchoolUsersFromDB().then(() => {
                    fetchCoursesFromDb().then(() => {
                        authStore.setGlobalLoading(false);
                    });
                });
            });
        }
    }, [authStore.user]);

    useEffect(() => {
        if (!generalStore.userSchool?.id) {
            yearBatchesStore.setYearBatchesForSchool([]);
            yearBatchesStore.setLoading(false);
            return;
        }

        const yearBatchesQuery = query(
            collection(db, "year_batches"),
            where("linkedSchoolId", "==", generalStore.userSchool.id)
        );

        const unsubscribe = onSnapshot(
            yearBatchesQuery,
            snapshot => {
                const newYearBatches = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as IYearBatch[];

                yearBatchesStore.setYearBatchesForSchool(newYearBatches);
                yearBatchesStore.setLoading(false);
            },
            error => {
                yearBatchesStore.setError(error.message);
                yearBatchesStore.setLoading(false);
            }
        );

        return () => unsubscribe(); // Clean up listener on component unmount
    }, [generalStore.userSchool?.id, yearBatchesStore]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    if (authStore.globalLoading) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <OrbitingLoader />
            </main>
        );
    }

    const featureRenderer = () => {
        switch (generalStore.currentTab) {
            case Tabs.LIFE_OS:
                return <LifeOS />;
            case Tabs.COURSES:
                return <CourseView />;
            case Tabs.SCHOOL:
                return <School />;
            case Tabs.PEOPLE:
                return <People />;
            case Tabs.YEAR_BATCHES:
                return <YearBatches />;
            case Tabs.COURSES_ADMIN_VIEW:
                return <div>Courses Admin View</div>;
            case Tabs.REPORTS:
                return <div>Reports</div>;
            default:
                return <LifeOS />;
        }
    };

    return (
        <>
            <JoinCourseDialog />
            <Toast
                isVisible={generalStore.isToastVisible}
                text={generalStore.toastText}
                isSuccessToast={generalStore.isSuccessToast}
            />
            <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <CustomDiv className="bg-white mt-3 mx-3 rounded-xl p-4 flex justify-between items-center border-gray-200 border shadow-md">
                    <div
                        className="flex items-center justify-left cursor-pointer gap-2 border p-2 rounded-md shadow-md"
                        onMouseEnter={() => setHoverLogos(true)}
                        onMouseLeave={() => setHoverLogos(false)}
                    >
                        <div className="flex items-center justify-center max-w-fit gap-1">
                            <LogoAppIcon className="size-8" />
                            {hoverLogos && (
                                <CustomText className="font-bold text-sm">
                                    BetterBac
                                </CustomText>
                            )}
                        </div>
                        <X className="size-3" />
                        <div className="flex items-center">
                            <div className="flex items-center justify-center max-w-fit gap-2">
                                <img
                                    src={generalStore.userSchool?.photoURL}
                                    className="size-[22px] rounded-full"
                                    alt="School Logo"
                                />
                                {hoverLogos && (
                                    <CustomText className="font-bold text-sm">
                                        {generalStore.userSchool?.name}
                                    </CustomText>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6">
                        <CustomButton
                            onClick={() => {
                                authStore.setGlobalLoading(true);
                                localStorage.removeItem("currentTab");
                                auth.signOut();
                            }}
                        >
                            Sign out
                        </CustomButton>
                        {!authStore.user?.isEducator && (
                            <CustomPlusButton
                                onClick={() =>
                                    joinCourseStore.setIsJoinCourseDialogOpen(
                                        true
                                    )
                                }
                            />
                        )}
                        <Bell
                            size={20}
                            className="stroke-gray-600 hover:stroke-black cursor-pointer transition-transform transform hover:scale-[1.05]"
                        />
                        <Pfp />
                    </div>
                </CustomDiv>

                {/* Content */}
                <div className="flex size-full overflow-hidden p-3">
                    {/* Sidebar */}
                    <Sidebar
                        isDropdownOpen={isDropdownOpen}
                        toggleDropdown={toggleDropdown}
                    />

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-scroll overflow-x-hidden">
                        {featureRenderer()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default observer(Dashboard);
