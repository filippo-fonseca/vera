import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useGeneralStore } from "@BetterBac/state/General.store";
import {
    getStorage,
    ref,
    listAll,
    getDownloadURL,
    getMetadata,
} from "firebase/storage";
import { useRouter } from "next/navigation";
import { storage } from "../../../../../../config/firebase";
import { FaFolder } from "react-icons/fa";
import { Slash, Squirrel, Nut, Home } from "lucide-react";
import { getFileExtension } from "@BetterBac/lib/utils";
import { fileIconRenderer } from "@BetterBac/lib/extraUtils/fileIconRenderer";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import CustomText from "@BetterBac/components/common/CustomText";
import Link from "next/link";
import CourseSpinnerLoader from "../Misc/CourseSpinnerLoader/CourseSpinnerLoader";
import SquirrelEmpty from "@BetterBac/components/common/SquirrelEmpty";

interface FileFolder {
    name: string;
    isFolder: boolean;
    url?: string;
    size?: number;
    uploadDate?: string;
    children?: FileFolder[];
}

const Files = () => {
    const generalStore = useGeneralStore();
    const [fileTree, setFileTree] = useState<FileFolder[]>([]);
    const [currentPath, setCurrentPath] = useState<string>("");
    const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
    const [isRootEmpty, setIsRootEmpty] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch file and folder data
    const fetchItems = async (path: string) => {
        setIsLoading(true);
        setError(null);
        const listRef = ref(
            storage,
            `courseFileRepos/${generalStore.activeCourse.id}/${path}`
        );
        try {
            const res = await listAll(listRef);
            const fetchedFiles: FileFolder[] = await Promise.all(
                res.items.map(async item => {
                    const url = await getDownloadURL(item);
                    const metadata = await getMetadata(item);
                    return {
                        name: item.name,
                        isFolder: false,
                        url,
                        size: metadata.size,
                        uploadDate: new Date(
                            metadata.timeCreated
                        ).toLocaleDateString(),
                    };
                })
            );
            const folders: FileFolder[] = await Promise.all(
                res.prefixes.map(async folderRef => {
                    return {
                        name: folderRef.name.split("/").pop() || "",
                        isFolder: true,
                        children: [],
                    };
                })
            );
            if (
                path === "" &&
                fetchedFiles.length === 0 &&
                folders.length === 0
            ) {
                setIsRootEmpty(true);
            } else {
                setIsRootEmpty(false);
                setFileTree([...folders, ...fetchedFiles]);
            }
        } catch (error) {
            console.error("Error fetching items:", error);
            setError("Error fetching files. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch items on course change or path change
    useEffect(() => {
        // Reset state when course changes
        setCurrentPath("");
        setFileTree([]);
        setIsRootEmpty(false);
        fetchItems(""); // Fetch items for the root path
        setBreadcrumb([]);
    }, [generalStore.activeCourse.id]);

    useEffect(() => {
        fetchItems(currentPath);
        setBreadcrumb(currentPath.split("/").filter(Boolean));
    }, [currentPath]);

    const handleFolderClick = async (folderName: string) => {
        const newPath = `${currentPath}${folderName}/`;
        setCurrentPath(newPath);
    };

    const handleFileClick = (fileUrl: string) => {
        window.open(fileUrl, "_blank");
    };

    const handleBreadcrumbClick = (index: number) => {
        const newPath = breadcrumb.slice(0, index + 1).join("/") + "/";
        setCurrentPath(newPath);
    };

    const handleRootClick = () => {
        setCurrentPath("");
    };

    const FileTreeNode = ({ item, idx }: { item: FileFolder; idx: number }) => {
        return (
            <div className="space-y-4">
                {item.isFolder ? (
                    <div
                        className="flex items-center px-2 h-12 rounded-xl hover:shadow-md border hover:border-black cursor-pointer hover:text-gray-600 transition-transform transform hover:scale-[1.01]"
                        onClick={() => handleFolderClick(item.name)}
                    >
                        <FaFolder
                            size={20}
                            className="ml-1 mr-2"
                            color={generalStore.activeCourse.courseColor}
                        />
                        <CustomText className="font-medium text-sm">
                            {item.name}
                        </CustomText>
                    </div>
                ) : (
                    <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div
                            className={`flex items-center px-2 h-12 rounded-xl hover:shadow-md border hover:border-black cursor-pointer hover:text-blue-600 transition-transform transform hover:scale-[1.01] ${
                                idx !== fileTree.length - 1 && "mb-4"
                            }`}
                        >
                            {fileIconRenderer({
                                type: getFileExtension(item.name),
                                isSmall: true,
                            })}
                            <CustomDiv className="flex-1 ml-2">
                                <CustomText className="font-medium text-sm">
                                    {item.name}
                                </CustomText>
                            </CustomDiv>
                            <div className="text-gray-600 text-sm">
                                {item.uploadDate
                                    ? `Uploaded: ${item.uploadDate}`
                                    : "Uploaded: Unknown"}{" "}
                                |{" "}
                                {item.size
                                    ? `${(item.size / 1024 / 1024).toFixed(
                                          2
                                      )} MB`
                                    : "Size: Unknown"}
                            </div>
                        </div>
                    </Link>
                )}
                {item.isFolder && item.children && (
                    <div className="ml-4">
                        {item.children.map((child, idx) => (
                            <FileTreeNode
                                key={child.name}
                                item={child}
                                idx={idx}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 h-full flex flex-col w-full p-6 bg-white border rounded-xl shadow-md">
            <CustomText className="text-xl font-bold">
                Class file repo
            </CustomText>
            {!isRootEmpty && (
                <nav className="w-full my-4" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center rtl:space-x-reverse">
                        <li className="inline-flex items-center">
                            <a
                                href="#"
                                onClick={handleRootClick}
                                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-black"
                            >
                                <Home
                                    className="w-4 h-4 me-2"
                                    aria-hidden="true"
                                />
                                Root
                            </a>
                        </li>
                        {breadcrumb.map((crumb, index) => (
                            <li
                                key={index}
                                className="inline-flex items-center"
                            >
                                <Slash
                                    className="h-4 text-gray-400 -rotate-[25deg]"
                                    aria-hidden="true"
                                />
                                {index < breadcrumb.length - 1 ? (
                                    <a
                                        href="#"
                                        onClick={() =>
                                            handleBreadcrumbClick(index)
                                        }
                                        className="text-sm font-medium text-gray-700 hover:text-black"
                                    >
                                        {crumb}
                                    </a>
                                ) : (
                                    <span className="text-sm font-semibold text-black">
                                        {crumb}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}
            {isLoading ? (
                <CourseSpinnerLoader />
            ) : error ? (
                <div className="text-red-500 text-center mt-4">{error}</div>
            ) : (
                <div className="w-full">
                    {fileTree.length === 0 ? (
                        <CustomDiv className="text-gray-600 flex flex-col items-center gap-2 justify justify-center mt-10">
                            <SquirrelEmpty
                                customSquirrelClassname="size-8"
                                customNutClassname="size-4"
                                header="Sorry, there are no files or folders here at the moment."
                                subHeader="Check back later for updates."
                            />
                        </CustomDiv>
                    ) : (
                        fileTree.map((item, idx) => (
                            <FileTreeNode
                                key={item.name}
                                item={item}
                                idx={idx}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default observer(Files);
