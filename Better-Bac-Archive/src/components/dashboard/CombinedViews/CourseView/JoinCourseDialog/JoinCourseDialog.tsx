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
import { BugPlay } from "lucide-react";
import { useJoinCourseStore } from "@BetterBac/state/CourseView/JoinCourse.store";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
} from "firebase/firestore";
import { useAuthStore } from "@BetterBac/state/Auth.store"; // Assuming you have an auth store for user information
import { ICourse, Tabs } from "@BetterBac/lib/GlobalTypes";

const JoinCourseDialog = () => {
    const generalStore = useGeneralStore();
    const joinCourseStore = useJoinCourseStore();
    const authStore = useAuthStore(); // Access the auth store to get user information
    const firestore = getFirestore();
    const [error, setError] = React.useState<boolean>(false);

    const disabled: boolean =
        joinCourseStore.tempCode == null ||
        joinCourseStore.tempCode === "" ||
        joinCourseStore.tempCode.length !== 6;

    const submitCode = async () => {
        const code = joinCourseStore.tempCode.trim();

        try {
            // Query the "courses" collection to find matching course codes
            const coursesRef = collection(firestore, "courses");
            const q = query(
                coursesRef,
                where("id", ">=", code),
                where("id", "<=", code + "\uf8ff")
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError(true);
                generalStore.setIsToastVisible(true);
                generalStore.setToastText(
                    "Sorry! This code is invalid. Try again or ask your instructor to add you directly with your name."
                );

                setTimeout(() => {
                    generalStore.setIsToastVisible(false);
                    generalStore.setToastText(null);
                }, 4000);

                return;
            }

            // Assume there is only one course with the matching code
            const courseDoc = querySnapshot.docs[0];
            const courseData = courseDoc.data() as ICourse;

            // Add user to the course's studentIds array
            const userId = authStore.user.id;
            const updatedStudentIds = courseData.studentIds
                ? [...courseData.studentIds, userId]
                : [userId];

            const courseDocRef = doc(firestore, "courses", courseDoc.id);
            await updateDoc(courseDocRef, { studentIds: updatedStudentIds });

            // Update generalStore with the new course
            const currentCourses = generalStore.userCourses || [];
            if (!currentCourses.some(course => course.id === courseData.id)) {
                generalStore.setUserCourses([...currentCourses, courseData]);
            }

            if (generalStore.currentTab !== Tabs.COURSES) {
                generalStore.setCurrentTab(Tabs.COURSES);
            }

            generalStore.setActiveCourse(courseData);

            // Close the dialog
            joinCourseStore.setIsJoinCourseDialogOpen(false);
            setError(false);

            // Show success toast
            generalStore.setIsToastVisible(true);
            generalStore.setToastText("Successfully joined course!");
            generalStore.setIsSuccessToast(true);

            setTimeout(() => {
                generalStore.setIsToastVisible(false);
                generalStore.setToastText(null);
                generalStore.setIsSuccessToast(false);
            }, 4000);
        } catch (error) {
            console.error("Error joining course: ", error);
            alert(
                "An error occurred while trying to join the course. Please try again."
            );
            setError(true);

            // Ensure the success toast is not shown if there is an error
            generalStore.setIsToastVisible(false);
            generalStore.setToastText(null);
            generalStore.setIsSuccessToast(false);
        }
    };

    return (
        <Dialog
            open={joinCourseStore.isJoinCourseDialogOpen}
            onOpenChange={() => {
                joinCourseStore.setIsJoinCourseDialogOpen(
                    !joinCourseStore.isJoinCourseDialogOpen
                );
                joinCourseStore.setTempCode("");
            }}
        >
            <DialogContent className="min-w-[650px] bg-white">
                <CustomDiv className="flex flex-col gap-3">
                    <CustomDiv className="flex items-center justify-center p-2 border shadow-md w-max rounded-xl">
                        <BugPlay size={36} />
                    </CustomDiv>
                    <CustomDiv>
                        <CustomText className="text-xl font-semibold">
                            Join a course via a code.
                        </CustomText>
                        <CustomText className="text-sm text-gray-600">
                            Ask your instructor for it — they should find it in
                            on their view of the course's page.
                        </CustomText>
                    </CustomDiv>
                </CustomDiv>
                <div className="w-full mt-2">
                    <label className="block mb-2 text-sm font-medium">
                        <CustomText>
                            Enter the 6-digit code for the course you wish to
                            join:
                        </CustomText>
                    </label>
                    <CustomTextInput
                        value={joinCourseStore.tempCode}
                        onChange={e =>
                            joinCourseStore.setTempCode(e.target.value)
                        }
                        placeholder="hd7hfn"
                        onEnterPress={() => {
                            if (!disabled) {
                                submitCode();
                            }
                        }}
                    />
                </div>
                <CustomText className="text-xs text-gray-600 mt-2">
                    Alternatively, teachers can also add you directly with just
                    your name.
                </CustomText>
                <DialogFooter className="mt-8">
                    <CustomButton onClick={submitCode} disabled={disabled}>
                        Join
                    </CustomButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default observer(JoinCourseDialog);
