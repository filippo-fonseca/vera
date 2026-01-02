import LogoAppIcon from "@BetterBac/app/icons/Brand/LogoApp.icon";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import AnimatedGradientText from "@BetterBac/components/dashboard/CombinedViews/CourseView/PrimaryWidget/CleoBlurb/AnimatedGradientText";
import { cn } from "@BetterBac/lib/utils";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import { useInvitedUserStore } from "@BetterBac/state/InvitedUser.store";
import { ChevronRight } from "lucide-react";
import { observer } from "mobx-react";
import Link from "next/link";
import React from "react";

interface IInvitedUserFormTemplate {
    handleLogin: (e: any) => void;
    disabled: boolean;
    email: string;
    isStudentLogin?: boolean;
}

const InvitedUserFormTemplate = (props: IInvitedUserFormTemplate) => {
    const invitedUserStore = useInvitedUserStore();

    return (
        <div className="flex flex-col items-center gap-16 bg-white border shadow-md px-20 py-10 rounded-xl z-50">
            <div>
                <div className="flex flex-col items-center gap-2">
                    <CustomDiv>
                        <LogoAppIcon className="size-[100px]" />
                    </CustomDiv>
                    <div className="text-center flex flex-col gap-2">
                        <AnimatedGradientText>
                            <span
                                className={cn(
                                    `inline animate-gradient bg-gradient-to-r from-pink-500 via-purple-400 to-pink-400 bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                                )}
                            >
                                {props.isStudentLogin ? "Student" : "Educator"}
                            </span>
                        </AnimatedGradientText>
                        <CustomDiv>
                            <CustomText className="text-2xl font-bold">
                                Welcome to BetterBac.
                            </CustomText>
                            <CustomText className="text-gray-600">
                                Your email is valid! Please activate your
                                account.
                            </CustomText>
                        </CustomDiv>
                    </div>
                </div>

                <div className="flex flex-col w-full gap-6 mt-8">
                    <div className="w-full">
                        <label
                            htmlFor="name-input"
                            className="block mb-2 text-sm font-medium"
                        >
                            <CustomText>Full name</CustomText>
                        </label>
                        <CustomTextInput
                            type="text"
                            id="name-input"
                            placeholder="Your full name"
                            onChange={e =>
                                invitedUserStore.setTempDisplayName(
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div className="w-full">
                        <label
                            htmlFor="password-input"
                            className="block mb-2 text-sm font-medium"
                        >
                            <CustomText>Password</CustomText>
                        </label>
                        <CustomTextInput
                            type="password"
                            id="password-input"
                            placeholder="•••••••••••••"
                            onChange={e =>
                                invitedUserStore.setTempPassword(e.target.value)
                            }
                            customBottomText="Must be a minimum of six characters. Make it strong!"
                            onEnterPress={e => {
                                if (!props.disabled) {
                                    props.handleLogin(e);
                                }
                            }}
                        />
                    </div>
                    <CustomButton
                        type="button"
                        onClick={props.handleLogin}
                        disabled={props.disabled}
                        addedClassname="w-full"
                    >
                        Active account
                    </CustomButton>
                </div>
            </div>
            {/* <div className="text-center flex flex-col gap-2">
                <CustomText className="text-sm text-gray-600">
                    {props.isStudentLogin
                        ? "Are you a teacher or school admin?"
                        : "Are you a student? Fret not."}{" "}
                    <Link
                        href={
                            props.isStudentLogin
                                ? "/auth/educator"
                                : "/auth/student"
                        }
                        className="underline hover:opacity-50 font-medium cursor-pointer"
                    >
                        Click here.
                    </Link>
                </CustomText>
                <CustomText className="text-sm text-gray-600">
                    Want to go back to the{" "}
                    <Link
                        href="/"
                        className="underline hover:opacity-50 font-medium cursor-pointer"
                    >
                        home page?
                    </Link>
                </CustomText>
            </div> */}
        </div>
    );
};

export default observer(InvitedUserFormTemplate);
