// lib/utils.ts
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as EmailValidator from "email-validator";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Retrieves a random loading message for an IB Diploma revision app.
 * @returns {string} A random loading message.
 */
export const getRandomLoadingMessage = (): string => {
    const messages: string[] = [
        "Loading... because even our servers need coffee for IB-level thinking!",
        "Hang tight! Our servers are tackling IB problems so you don't have to.",
        "Loading... as fast as an IB student during exam season (aka, not very).",
        "Loading... because even Einstein needed a break between theories.",
        "Patience, young scholar! Even our servers respect the complexity of the IB.",
        "Loading... because even algorithms need to stretch before tackling IB equations.",
        "Hold on! We're recalibrating our quantum processor for maximum IB efficiency.",
        "Loading... like an IB essay, it's all about the preparation.",
        "Just a moment! We're channeling our inner IB student to crunch those numbers.",
        "Loading... because decoding IB mysteries takes a bit of time (and a lot of brainpower).",
    ];

    const randomIndex: number = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
};

export const validateEmail = (email: string) => {
    return EmailValidator.validate(email);
};

type IBGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const calculateIBGrade = (score: number): IBGrade => {
    if (score < 0 || score > 100) {
        throw new Error("Score must be between 0 and 100.");
    }

    if (score < 34) {
        return 1;
    } else if (score < 44) {
        return 2;
    } else if (score < 52) {
        return 3;
    } else if (score < 60) {
        return 4;
    } else if (score < 70) {
        return 5;
    } else if (score < 80) {
        return 6;
    } else {
        return 7;
    }
};

export const truncate = (str: string | null, n: number) => {
    return str?.length > n ? `${str?.substring(0, n - 1)}...` : str ?? "";
};

export const getFileExtension = (fileName: string): string => {
    const lastDotIndex = fileName?.lastIndexOf(".");
    return lastDotIndex !== -1
        ? fileName?.substring(lastDotIndex + 1).toLowerCase()
        : "";
};

export const IB_ACTIVE_YEARS = [
    new Date().getFullYear() + 1,
    new Date().getFullYear() + 2,
];
