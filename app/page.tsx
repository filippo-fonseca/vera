"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import CustomButton from "@/components/common/CustomButton/CustomButton";
import {
  GraduationCap,
  Users,
  BookOpen,
  BarChart,
  Sparkles,
  Target,
} from "lucide-react";
import Particles from "@/components/landing/Particles";
import TypingAnimation from "@/components/landing/TypingAnimation";
import WordRotate from "@/components/landing/WordRotate";
import { BentoCard, BentoGrid } from "@/components/landing/BentoGrid";
import Marquee from "@/components/landing/Marquee";
import { cn } from "@/lib/utils";
import LogoAppIcon from "@/components/icons/LogoAppIcon";

const features = [
  {
    name: "Student Management",
    description:
      "Track progress, manage records, and maintain seamless communication with students and guardians.",
    Icon: GraduationCap,
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 opacity-50" />
    ),
  },
  {
    name: "Powerful Analytics",
    description:
      "Gain insights with comprehensive analytics and customizable reporting tools.",
    Icon: BarChart,
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <Marquee
        pauseOnHover
        className="absolute blur-sm top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
      >
        {[
          { title: "Attendance", value: "98.5%" },
          { title: "Avg Grade", value: "87.2%" },
          { title: "Completion", value: "94.1%" },
          { title: "Engagement", value: "91.8%" },
        ].map((stat, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-col">
              <figcaption className="text-sm font-medium">
                {stat.title}
              </figcaption>
              <p className="text-2xl font-bold text-pink-500 mt-2">
                {stat.value}
              </p>
            </div>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    name: "Staff Collaboration",
    description:
      "Enable seamless collaboration between teachers, administrators, and staff members.",
    Icon: Users,
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
    ),
  },
  {
    name: "Course Management",
    description:
      "Organize courses, assignments, and learning materials effortlessly.",
    Icon: BookOpen,
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50" />
    ),
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showRotate, setShowRotate] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowRotate(true);
    }, 4000);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      // Route based on user role
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "teacher") {
        router.push("/teacher");
      } else if (user.role === "student") {
        router.push("/student");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-sm font-medium text-gray-400">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
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

      <div
        className={`flex flex-col items-center gap-16 bg-white border shadow-md px-20 py-10 rounded-xl z-50 mb-4 ${
          showRotate && "w-full"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="size-9 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg border border-gray-200">
            <LogoAppIcon className="size-7" />
          </div>
          <h1 className="font-bold text-4xl text-black">Vera</h1>
        </div>

        <div className="flex flex-col items-center justify-center text-center gap-6">
          <div className="flex flex-col items-center">
            <TypingAnimation
              text="...because a learning management system should be"
              duration={50}
              className="text-3xl font-bold"
            />
            <div
              className={`transition-all duration-500 ${
                showRotate ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              <WordRotate
                words={[
                  "simple.",
                  "for humans.",
                  "elegant.",
                  "easy to use.",
                  "secure.",
                  "reliable.",
                  "clean.",
                  "intuitive.",
                  "functional.",
                ]}
                duration={2000}
                className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-pink-500 via-[#ff2975] to-[#ff1eec] bg-clip-text text-center text-5xl font-black leading-none tracking-tighter text-transparent"
              />
            </div>
          </div>

          <TypingAnimation
            text="Experience the joys of an ecosystem meticulously tailored to ensure both teachers and students can focus on what matters most."
            duration={50}
            className="text-lg text-center font-medium text-gray-600 max-w-[650px]"
          />
        </div>

        <div className="flex gap-8 font-semibold scale-[1.15]">
          <Link href="/login">
            <CustomButton>Sign In</CustomButton>
          </Link>
          <Link href="/setup">
            <CustomButton isInverse>Get Started</CustomButton>
          </Link>
        </div>
      </div>

      <BentoGrid>
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>

      <div className="flex items-center justify-center mt-8">
        <p className="font-medium text-center w-full text-gray-600">
          Built with care for modern education
        </p>
      </div>
    </main>
  );
}
