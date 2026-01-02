"use client";

import { cn } from "@BetterBac/lib/utils";
import React from "react";
import Pfp from "../Pfp/Pfp";
import { IUser } from "@BetterBac/lib/GlobalTypes";

interface AvatarCirclesProps {
    className?: string;
    numPeople?: number;
    users: IUser[];
    onClick?: () => void;
}

const AvatarCircles = ({
    numPeople,
    className,
    users,
    onClick,
}: AvatarCirclesProps) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "z-10 flex -space-x-3 rtl:space-x-reverse transition-transform transform hover:scale-[1.08] cursor-pointer",
                className
            )}
        >
            {users?.map((user, index) => (
                <Pfp
                    key={index}
                    size="size-8"
                    customTextSize="text-[10px]"
                    customUser={user}
                    hasOpaqueBg
                    customBorder="border-2 border-white"
                />
            ))}
            {numPeople > 4 && (
                <div className="flex z-50 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black text-center text-[10px] font-semibold text-white hover:bg-gray-600">
                    +{numPeople - 4}
                </div>
            )}
        </div>
    );
};

export default AvatarCircles;
