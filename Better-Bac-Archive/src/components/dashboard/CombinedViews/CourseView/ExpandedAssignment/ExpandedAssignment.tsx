import React, { useEffect, useRef, useState } from "react";
import CustomText from "@BetterBac/components/common/CustomText";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { ArrowLeft, Forward, Mail, Trash } from "lucide-react";
import { observer } from "mobx-react";
import ExpandedAssignmentHeader from "./Sub/ExpandedAssignmentHeader";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    getMetadata,
    deleteObject,
} from "firebase/storage";
import { useAuthStore } from "@BetterBac/state/Auth.store"; // Import your auth store
import { storage, db } from "../../../../../../config/firebase";
import PDFIcon from "@BetterBac/app/icons/FileIcons/PDF.icon";
import DOCXIcon from "@BetterBac/app/icons/FileIcons/DOCX.icon";
import Link from "next/link";
import { updateDoc, doc, onSnapshot } from "firebase/firestore";
import { IAssignment, IAssignmentInstance } from "@BetterBac/lib/GlobalTypes";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import JPGIcon from "@BetterBac/app/icons/FileIcons/JPG.icon";
import PNGIcon from "@BetterBac/app/icons/FileIcons/PNG.icon";
import DEFAULTIcon from "@BetterBac/app/icons/FileIcons/DEFAULT.icon";
import POWERPOINTIcon from "@BetterBac/app/icons/FileIcons/POWERPOINT.icon";
import { getFileExtension, truncate } from "@BetterBac/lib/utils";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import FileStrip from "./Sub/FileStrip";
import CourseSpinnerLoader from "../Misc/CourseSpinnerLoader/CourseSpinnerLoader";
import { getAssignmentInstanceData } from "@BetterBac/lib/extraUtils/getAssignmentInstanceData";

const ExpandedAssignment: React.FC = () => {
    const generalStore = useGeneralStore();
    const authStore = useAuthStore();
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);

    const [expandedAssignmentInstance, setExpandedAssignmentInstance] =
        useState<IAssignmentInstance | null>(null);

    const [files, setFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<
        { name: string; type: string; url: string; uploadDate: Date }[]
    >([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [warningText, setWarningText] = useState<string | null>(null);

    React.useEffect(() => {
        setExpandedAssignmentInstance(
            getAssignmentInstanceData({
                assignmentInstances:
                    generalStore.activeCourseAssignmentInstances,
                linkedAssignmentId: generalStore.expandedAssignment.id,
                linkedStudentId: authStore.user.id,
            })
        );
        const dueDateSeconds =
            generalStore.expandedAssignment.dueDate["seconds"];
        const currentSeconds = dayjs().unix();

        if (currentSeconds <= dueDateSeconds) {
            setWarningText(null);
        } else {
            setWarningText(
                "*The due date for this assignment has passed. You may still upload files, but if you do your submission will be marked as late."
            );
        }
    }, []);

    useEffect(() => {
        const fetchUploadedFiles = async () => {
            const storageRef = ref(
                storage,
                `assignmentFiles/${generalStore.expandedAssignment.id}/${authStore.user.id}`
            );
            try {
                const result = await listAll(storageRef);
                const files = await Promise.all(
                    result.items.map(async itemRef => {
                        const url = await getDownloadURL(itemRef);
                        const metadata = await getMetadata(itemRef);
                        return {
                            name: itemRef.name,
                            type: itemRef.name.split(".").pop() || "unknown",
                            url,
                            uploadDate: new Date(metadata.updated),
                        };
                    })
                );
                setUploadedFiles(files);
            } catch (error) {
                console.error("Error fetching uploaded files:", error);
            }
        };

        fetchUploadedFiles();
    }, [generalStore.expandedAssignment.id, authStore.user.id]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files) {
            setFiles(prevFiles => [
                ...prevFiles,
                ...Array.from(e.dataTransfer.files),
            ]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prevFiles => [
                ...prevFiles,
                ...Array.from(e.target.files),
            ]);
        }
    };

    // const getFileExtension = (fileType: string): string => {
    //     const extensions: { [key: string]: string } = {
    //         "application/pdf": "pdf",
    //         "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    //             "docx",
    //         // Add more MIME types and their extensions here as needed
    //     };
    //     return extensions[fileType] || "unknown";
    // };

    const handleTurnIn = async () => {
        if (files.length === 0) return;
        setIsUploading(true);

        const assignmentInstanceRef = doc(
            db,
            `assignment_instances/${expandedAssignmentInstance?.id}`
        );

        const uploadPromises = files.map(file => {
            // Get the file extension
            const fileExtension = getFileExtension(file.type);
            const fileName = file.name.includes(".")
                ? file.name
                : `${file.name}.${fileExtension}`;

            const storageRef = ref(
                storage,
                `assignmentFiles/${generalStore.expandedAssignment.id}/${authStore.user.id}/${fileName}`
            );
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise<{
                name: string;
                type: string;
                url: string;
                uploadDate: Date;
            }>((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    snapshot => {
                        // Handle progress if needed
                    },
                    error => {
                        console.error("Upload failed", error);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(
                                uploadTask.snapshot.ref
                            );
                            const metadata = await getMetadata(
                                uploadTask.snapshot.ref
                            );

                            // Check if metadata has a valid updated field
                            const uploadDate = metadata.updated
                                ? new Date(metadata.updated)
                                : new Date();

                            const newFile = {
                                name: fileName,
                                type: file.type,
                                url: downloadURL,
                                uploadDate,
                            };

                            // Update uploaded files state
                            setUploadedFiles(prevFiles => [
                                ...prevFiles,
                                newFile,
                            ]);

                            // Update assignment document in Firestore
                            await updateDoc(assignmentInstanceRef, {
                                isSubmitted: true,
                                dateSubmitted: uploadDate,
                            });

                            // Update local MobX store
                            if (generalStore.expandedAssignment) {
                                // Update all assignments and active course assignments
                                if (generalStore.allAssignments) {
                                    const updatedAssignments =
                                        generalStore.allAssignments.map(
                                            assignment => {
                                                if (
                                                    assignment.id ===
                                                    generalStore
                                                        .expandedAssignment.id
                                                ) {
                                                    return {
                                                        ...assignment,
                                                        isSubmitted: true,
                                                        dateSubmitted:
                                                            uploadDate,
                                                    };
                                                } else {
                                                    return assignment;
                                                }
                                            }
                                        );
                                    generalStore.setAllAssignments(
                                        updatedAssignments
                                    );
                                }

                                if (generalStore.activeCourseAssignments) {
                                    const updatedActiveCourseAssignments =
                                        generalStore.activeCourseAssignments.map(
                                            assignment => {
                                                if (
                                                    assignment.id ===
                                                    generalStore
                                                        .expandedAssignment.id
                                                ) {
                                                    return {
                                                        ...assignment,
                                                        isSubmitted: true,
                                                        dateSubmitted:
                                                            uploadDate,
                                                    };
                                                } else {
                                                    return assignment;
                                                }
                                            }
                                        );
                                    generalStore.setActiveCourseAssignments(
                                        updatedActiveCourseAssignments
                                    );
                                }
                            }

                            resolve(newFile);
                        } catch (error) {
                            console.error(
                                "Error getting download URL or updating assignment:",
                                error
                            );
                            reject(error);
                        }
                    }
                );
            });
        });

        try {
            await Promise.all(uploadPromises);
            setFiles([]);
        } catch (error) {
            console.error("Error uploading files:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteBeforeTurnIn = (fileName: string) => {
        setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const handleDeleteAfterTurnIn = async (fileName: string) => {
        const assignmentInstanceRef = doc(
            db,
            `assignment_instances/${expandedAssignmentInstance?.id}`
        );

        // Delete file from Firebase storage
        const fileRef = ref(
            storage,
            `assignmentFiles/${generalStore.expandedAssignment.id}/${authStore.user.id}/${fileName}`
        );

        try {
            await deleteObject(fileRef);

            // List all files in the directory
            const storageDirRef = ref(
                storage,
                `assignmentFiles/${generalStore.expandedAssignment.id}/${authStore.user.id}`
            );
            const result = await listAll(storageDirRef);
            const uploadDates = await Promise.all(
                result.items.map(async itemRef => {
                    const metadata = await getMetadata(itemRef);
                    return new Date(metadata.updated).getTime(); // Convert Date to number (UNIX timestamp)
                })
            );

            console.log("Upload dates:", uploadDates);

            let latestDateSubmitted =
                uploadDates.length > 0
                    ? new Date(Math.max(...uploadDates))
                    : null;

            if (uploadDates.length === 0) {
                await updateDoc(assignmentInstanceRef, {
                    isSubmitted: false,
                    dateSubmitted: null,
                });
            } else {
                await updateDoc(assignmentInstanceRef, {
                    isSubmitted: true,
                    dateSubmitted: latestDateSubmitted,
                });
            }

            // Remove the file from uploadedFiles
            const updatedFiles = uploadedFiles.filter(
                file => file.name !== fileName
            );
            setUploadedFiles(updatedFiles);
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const getStatus = () => {
        if (!generalStore.expandedAssignment.requiresSubmission) {
            return expandedAssignmentInstance?.marksObtained
                ? "Marked by teacher."
                : "Awaiting grade from teacher.";
        } else {
            const dueDateSeconds =
                generalStore.expandedAssignment.dueDate["seconds"];
            const dateSubmittedSeconds =
                expandedAssignmentInstance?.dateSubmitted
                    ? expandedAssignmentInstance?.dateSubmitted["seconds"]
                    : null;

            if (dateSubmittedSeconds !== null) {
                // Calculate if turned in on time or late
                if (dateSubmittedSeconds <= dueDateSeconds) {
                    return "Turned in on time";
                } else {
                    return "Turned in late";
                }
            } else {
                // Calculate if pending or late
                const currentSeconds = dayjs().unix();
                if (currentSeconds <= dueDateSeconds) {
                    return "Pending";
                } else {
                    return "Late";
                }
            }
        }
    };

    useEffect(() => {
        const assignmentInstanceRef = doc(
            db,
            `assignment_instances/${expandedAssignmentInstance?.id}`
        );

        const unsubscribe = onSnapshot(assignmentInstanceRef, docSnapshot => {
            if (docSnapshot.exists()) {
                const updatedAssignment = docSnapshot.data() as IAssignment;
                generalStore.setExpandedAssignment(updatedAssignment);
            }
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [generalStore.expandedAssignment.id]);

    const UNFORMATTED_DUE_DATE_FOR_INFO =
        generalStore.expandedAssignment?.dueDate &&
        dayjs(generalStore.expandedAssignment?.dueDate["seconds"] * 1000);

    const UNFORMATTED_DATE_SUBMITTED_FOR_INFO =
        expandedAssignmentInstance?.dateSubmitted &&
        dayjs(expandedAssignmentInstance?.dateSubmitted["seconds"] * 1000);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg ml-3 h-full overflow-y-scroll">
            <div
                onClick={() => generalStore.setExpandedAssignment(null)}
                className="flex items-center text-gray-600 transition-transform transform hover:scale-[1.01] cursor-pointer"
            >
                <ArrowLeft
                    size={14}
                    className="cursor-pointer hover:text-gray-900"
                />
                <CustomText className="ml-2 text-sm font-medium">
                    Class dashboard
                </CustomText>
            </div>
            <ExpandedAssignmentHeader />
            <div className="mt-4">
                <div className="mt-4">
                    <CustomText className="text-sm font-medium text-gray-600">
                        Description
                    </CustomText>
                    <CustomText className="mt-1">
                        {generalStore.expandedAssignment.description}
                    </CustomText>
                </div>
                <div className="mt-4">
                    <CustomText className="text-sm font-medium text-gray-600">
                        Due Date
                    </CustomText>
                    <CustomText className="mt-1">
                        {UNFORMATTED_DUE_DATE_FOR_INFO?.format("MMMM D, YYYY")}{" "}
                        at {UNFORMATTED_DUE_DATE_FOR_INFO?.format("h:mma")}
                    </CustomText>
                </div>
                <div className="mt-4">
                    <CustomText className="text-sm font-medium text-gray-600">
                        Status
                    </CustomText>
                    <CustomText className="mt-1">
                        {getStatus()}
                        {expandedAssignmentInstance?.dateSubmitted &&
                            " on " +
                                UNFORMATTED_DATE_SUBMITTED_FOR_INFO.format(
                                    "MMMM D, YYYY"
                                ) +
                                " at " +
                                UNFORMATTED_DATE_SUBMITTED_FOR_INFO.format(
                                    "h:mma"
                                )}
                    </CustomText>
                </div>
                {generalStore.expandedAssignment.requiresSubmission ? (
                    <>
                        {uploadedFiles.length > 0 && (
                            <div className="mt-4">
                                <CustomText className="text-sm font-medium text-gray-600">
                                    Submitted Files
                                </CustomText>
                                <div className="mt-2 space-y-4">
                                    {uploadedFiles.map((file, idx) => {
                                        return (
                                            <FileStrip
                                                key={idx}
                                                {...file}
                                                handleDeleteAfterTurnIn={
                                                    handleDeleteAfterTurnIn
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="mt-4">
                            <CustomText className="text-sm text-gray-600 font-medium">
                                Upload Files
                            </CustomText>
                            {warningText && (
                                <CustomText className="text-red-500 mt-2 text-sm font-medium">
                                    {warningText}
                                </CustomText>
                            )}
                            <div
                                className={`${
                                    isDraggingOver
                                        ? "text-black border-black"
                                        : "hover:text-black hover:border-black text-gray-600"
                                } mt-2 py-8 border-2 border-dashed rounded-lg cursor-pointer  transition-transform transform hover:scale-[1.01]`}
                                onDragOver={handleDragOver}
                                onDragLeave={() => setIsDraggingOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <label
                                    htmlFor="fileInput"
                                    className="cursor-pointer flex flex-col items-center space-y-2"
                                >
                                    <svg
                                        className="w-16 h-16"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    <span className="font-medium">
                                        Drag and drop your files here
                                    </span>
                                    <span className="text-sm">
                                        {" "}
                                        or click to select from your device.
                                    </span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleChange}
                                    multiple
                                />
                                {/* <CustomText className="text-gray-400">
                            Drag and drop files here or{" "}
                            <span
                                className="text-blue-500 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                browse
                            </span>{" "}
                            to upload
                        </CustomText> */}
                            </div>
                            {isUploading ? (
                                <CourseSpinnerLoader />
                            ) : (
                                files.length > 0 && (
                                    <div className="flex flex-col gap-8 mt-8 space-y-2">
                                        <div className="flex flex-col gap-2">
                                            <CustomText className="text-sm text-gray-600 font-medium">
                                                Selected Files
                                            </CustomText>
                                            {files.map((file, idx) => {
                                                return (
                                                    <FileStrip
                                                        name={file.name}
                                                        type={file.type}
                                                        handleDeleteBeforeTurnIn={
                                                            handleDeleteBeforeTurnIn
                                                        }
                                                        key={idx}
                                                        size={file.size}
                                                    />
                                                );
                                            })}
                                        </div>

                                        <CustomButton
                                            onClick={handleTurnIn}
                                            disabled={isUploading}
                                            className="flex items-center justify-center gap-2 text-xs stroke-black hover:stroke-white font-semibold bg-white hover:bg-black hover:text-white active:scale-110 focus:outline-none border border-black focus:ring-4 focus:ring-gray-300 rounded-lg px-5 py-2.5 mb-2 transition-transform duration-150"
                                        >
                                            {!isUploading && (
                                                <Forward size={16} />
                                            )}
                                            {isUploading
                                                ? "Uploading..."
                                                : "Turn In"}
                                        </CustomButton>
                                    </div>
                                )
                            )}
                        </div>
                    </>
                ) : (
                    <CustomDiv className="mt-4">
                        <CustomText className="text-sm text-gray-600 font-medium">
                            This assignment does not require a submission on
                            BetterBac.
                        </CustomText>
                    </CustomDiv>
                )}
            </div>
        </div>
    );
};

export default observer(ExpandedAssignment);
