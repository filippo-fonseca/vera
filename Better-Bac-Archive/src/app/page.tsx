"use client";

import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { auth, db } from "../../config/firebase";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import { query, collection, where, onSnapshot } from "firebase/firestore";
import OrbitingLoader from "@BetterBac/components/common/OrbitingLoader";
import Particles from "@BetterBac/components/common/Particles/Particles";
import TypingAnimation from "@BetterBac/components/landing/TypingAnimationText/TypingAnimationText";
import WordRotate from "@BetterBac/components/landing/WordRotate";
import CustomText from "@BetterBac/components/common/CustomText";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import LogoAppIcon from "./icons/Brand/LogoApp.icon";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import BentoGridComponent from "@BetterBac/components/auth/BentoGridComponent";

const Home = () => {
    const router = useRouter();
    const authStore = useAuthStore();

    const [showRotate, setShowRotate] = React.useState(false);
    const [showSubText, setShowSubText] = React.useState(false);

    React.useEffect(() => {
        setTimeout(() => {
            setShowRotate(true);
        }, 4000);
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
            }
        });

        // Clean up the listener on unmount
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        if (authStore.user) {
            router.push("/dashboard");
        } else {
            router.push("/");
            setTimeout(() => authStore.setGlobalLoading(false), 1000);
        }
    }, [authStore.user]);

    if (authStore.globalLoading) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <OrbitingLoader />
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-9">
            <Particles
                className="absolute inset-0"
                quantity={5000}
                ease={80}
                color={"#00000040"}
                refresh
            />
            {/* <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
                 <div className='flex items-center justify-center gap-2'>
          <LogoAppIcon className='size-[70px]' />
          <CustomText className='font-bold text-3xl'>BetterBac</CustomText>
        </div>
                <p>hi</p>
                <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
                    <a
                        className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
                        href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        By{" "}
                        <Image
                            src="/vercel.svg"
                            alt="Vercel Logo"
                            className="dark:invert"
                            width={100}
                            height={24}
                            priority
                        />
                    </a>
                </div>
            </div> */}

            <div
                className={`flex flex-col items-center gap-16 bg-white border shadow-md px-20 py-10 rounded-xl z-50 mb-4 ${
                    showRotate && "w-full"
                }`}
            >
                <CustomDiv className="flex items-center justify-center gap-2">
                    <LogoAppIcon className="size-[70px]" />
                    <CustomText className="font-bold text-3xl">
                        BetterBac
                    </CustomText>
                </CustomDiv>
                <div className="flex flex-col items-center justify-center text-center gap-6">
                    <CustomText className="">
                        <TypingAnimation
                            text="...because an IBDP management platform should be"
                            duration={50}
                            className="text-3xl font-bold"
                        />{" "}
                        <div
                            className={`transition-all duration-500 ${
                                showRotate
                                    ? "max-h-32 opacity-100"
                                    : "max-h-0 opacity-0"
                            } overflow-hidden`}
                        >
                            <WordRotate
                                words={[
                                    "simple.",
                                    "elegant.",
                                    "easy to use.",
                                    "secure.",
                                    "reliable.",
                                    "relatable.",
                                    "clean.",
                                    "intuitive.",
                                    "functional.",
                                ]}
                                duration={2000}
                                className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-pink-500 via-[#ff2975] to-[#ff1eec] bg-clip-text text-center text-5xl font-black leading-none tracking-tighter text-transparent"
                            />
                        </div>
                    </CustomText>
                    <TypingAnimation
                        text={`Experience the joys of an ecosystem meticulously tailored to ensure both IB teachers, students, and coordinators can focus on what matters most.`}
                        duration={50}
                        className="text-lg text-center font-medium text-gray-600 max-w-[650px]"
                    />
                </div>
                <div className={`flex gap-8 font-semibold scale-[1.15]`}>
                    <Link href="/auth/educator">
                        <CustomButton>I am an educator</CustomButton>
                    </Link>
                    <Link href="/auth/student">
                        <CustomButton>I am a student</CustomButton>
                    </Link>
                </div>
            </div>
            <BentoGridComponent />

            <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left my-16">
                {/* <a
                    href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <h2 className="mb-3 text-2xl font-semibold">
                        Docs{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50">
                        Find in-depth information about Next.js features and
                        API.
                    </p>
                </a>

                <a
                    href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <h2 className="mb-3 text-2xl font-semibold">
                        Learn{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50">
                        Learn about Next.js in an interactive course
                        with&nbsp;quizzes!
                    </p>
                </a>

                <a
                    href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <h2 className="mb-3 text-2xl font-semibold">
                        Templates{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50">
                        Explore starter templates for Next.js.
                    </p>
                </a>

                <a
                    href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <h2 className="mb-3 text-2xl font-semibold">
                        Deploy{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-balance text-sm opacity-50">
                        Instantly deploy your Next.js site to a shareable URL
                        with Vercel.
                    </p>
                </a> */}
            </div>
            <CustomDiv className="flex items-center justify-center">
                <CustomText className="font-medium text-center w-full">
                    Made with ❤️ by Ivy League IB alumni who know what it takes.
                    Still in private beta: filippo.fonseca@yale.edu
                </CustomText>
            </CustomDiv>
        </main>
    );
};

export default observer(Home);
