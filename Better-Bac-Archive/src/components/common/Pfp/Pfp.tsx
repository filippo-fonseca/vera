import { IUser } from "@BetterBac/lib/GlobalTypes";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";
import React from "react";

interface IUserPfp {
    isSchool?: boolean;
    size?: string; // Add the size prop
    customUser?: IUser;
    customTextSize?: string;
    customBorder?: string;
    hasOpaqueBg?: boolean;
}

const UserPfp = (props: IUserPfp) => {
    const { userSchool } = useGeneralStore();
    const { user } = useAuthStore();

    const getInitials = (name: string) => {
        const names = name.split(" ");
        const initials = names.map(name => name[0]).join("");
        return initials.toUpperCase();
    };

    const name =
        props.customUser?.displayName ??
        (props.isSchool ? userSchool?.name : user?.displayName);
    const userToUse = props.customUser ?? (props.isSchool ? userSchool : user);
    const size = props.size || "size-10"; // Default to "size-10" if no size prop is provided

    // Determine styles based on conditions
    const bgColor = userToUse?.photoURL
        ? "" // No background color for images
        : props.hasOpaqueBg
        ? "bg-pink-500" // Background color when hasOpaqueBg is true
        : "bg-pink-500/30"; // Default background color
    const textColor = userToUse?.photoURL
        ? "" // No text color for images
        : props.hasOpaqueBg
        ? "text-black" // Text color when hasOpaqueBg is true
        : "text-pink-500"; // Default text color

    const border = props.customBorder ?? "border-2 border-pink-500";

    return userToUse?.photoURL ? (
        <img
            src={userToUse.photoURL}
            className={`${size} rounded-full ${border} cursor-pointer transition-transform transform hover:scale-[1.01]`}
            alt="Avatar"
        />
    ) : (
        <div
            className={`${size} ${border} cursor-pointer rounded-full flex items-center justify-center ${bgColor} ${textColor}  font-medium ${
                props.customTextSize ?? "text-sm"
            } transition-transform transform hover:scale-[1.05]`}
        >
            {name ? getInitials(name) : "?"}
        </div>
    );
};

export default observer(UserPfp);
