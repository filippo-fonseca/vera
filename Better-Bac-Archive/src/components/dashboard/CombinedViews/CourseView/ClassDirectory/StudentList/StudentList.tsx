import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@BetterBac/components/common/Card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@BetterBac/components/common/Avatar";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../../../../config/firebase";
import CustomText from "@BetterBac/components/common/CustomText";
import Link from "next/link";
import { Mail } from "lucide-react";
import MemberDisplay from "@BetterBac/components/common/MemberDisplay";
import { observer } from "mobx-react";
import { outputFilteredUsersById } from "@BetterBac/lib/extraUtils/outputFilteredUsersById";

interface IUser {
    id: string;
    displayName: string;
    email: string;
    isEducator: boolean;
    photoURL?: string;
    linkedSchoolId: string;
}

const StudentList = () => {
    const authStore = useAuthStore();
    const generalStore = useGeneralStore();
    const [students, setStudents] = useState<IUser[]>([]);

    useEffect(() => {
        const courseStudents = outputFilteredUsersById({
            userArray: generalStore.userSchoolAllUsers,
            userIds: generalStore.activeCourse?.studentIds || [],
        });

        setStudents(courseStudents);
    }, [generalStore.activeCourse?.studentIds]);

    return (
        <Card className="w-full border-none shadow-none">
            <CardHeader className="p-0">
                <CardTitle>See who's who</CardTitle>
                <CardDescription>
                    Need to reach out to a classmate or see the students in this
                    class? {"We've"} got you covered.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-0 pt-6">
                {students.map((student: IUser, idx: number) => (
                    <MemberDisplay key={idx} {...student} />
                ))}
                <CustomText className="text-gray-600 text-sm">
                    There are a total of{" "}
                    <span className="font-semibold">
                        {students.length} students
                    </span>{" "}
                    in this course.{" "}
                </CustomText>
            </CardContent>
        </Card>
    );
};

export default observer(StudentList);
