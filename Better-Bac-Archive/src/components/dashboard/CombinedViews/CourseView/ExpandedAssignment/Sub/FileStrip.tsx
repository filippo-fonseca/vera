import DEFAULTIcon from "@BetterBac/app/icons/FileIcons/DEFAULT.icon";
import DOCXIcon from "@BetterBac/app/icons/FileIcons/DOCX.icon";
import JPGIcon from "@BetterBac/app/icons/FileIcons/JPG.icon";
import PDFIcon from "@BetterBac/app/icons/FileIcons/PDF.icon";
import PNGIcon from "@BetterBac/app/icons/FileIcons/PNG.icon";
import POWERPOINTIcon from "@BetterBac/app/icons/FileIcons/POWERPOINT.icon";
import CustomText from "@BetterBac/components/common/CustomText";
import { fileIconRenderer } from "@BetterBac/lib/extraUtils/fileIconRenderer";
import { getFileExtension } from "@BetterBac/lib/utils";
import dayjs from "dayjs";
import { Trash } from "lucide-react";
import { observer } from "mobx-react";
import React from "react";

interface IFileStrip {
    name: string;
    type: string;
    url?: string;
    uploadDate?: Date;
    handleDeleteAfterTurnIn?: (fileName: string) => void;
    handleDeleteBeforeTurnIn?: (fileName: string) => void;
    size?: number;
}

const FileStrip = (file: IFileStrip) => {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const fileExtension = getFileExtension(file.name);

    const UNFORMATTED_UPLOAD_DATE = dayjs(file.uploadDate);

    return (
        <div
            onClick={() =>
                //only open the file if it's been uploaded, otherwise it will not work (not in FB Storage yet):
                file.handleDeleteAfterTurnIn && window.open(file.url)
            }
            key={file.name}
            className={`flex items-center justify-between border px-2 py-4 rounded-xl hover:shadow-md hover:border-black cursor-pointer transition-transform transform hover:scale-[1.01] ${
                file.handleDeleteAfterTurnIn && "hover:text-blue-600"
            }`}
        >
            <div className="flex items-center">
                {fileIconRenderer({ type: fileExtension })}
                <div className="flex flex-col justify-between h-full ml-2 leading-[1rem]">
                    <CustomText className="font-medium">{file.name}</CustomText>
                    <CustomText className="text-xs text-gray-600">
                        {file.handleDeleteBeforeTurnIn ? (
                            <>
                                {fileExtension?.toUpperCase()} -{" "}
                                {formatBytes(file.size)}
                            </>
                        ) : (
                            <>
                                Uploaded on{" "}
                                {UNFORMATTED_UPLOAD_DATE.format("MMMM D, YYYY")}{" "}
                                at {UNFORMATTED_UPLOAD_DATE.format("h:mma")}
                            </>
                        )}
                    </CustomText>
                </div>
            </div>
            <div
                onClick={e => {
                    e.stopPropagation();
                    if (file.handleDeleteAfterTurnIn) {
                        file.handleDeleteAfterTurnIn(file.name);
                    } else {
                        file.handleDeleteBeforeTurnIn(file.name);
                    }
                }}
                className="flex items-center justify-center cursor-pointer"
            >
                <Trash
                    // className="text-red-500 hover:text-red-700 ml-2"
                    size={14}
                    className="text-gray-600 hover:text-gray-900 mr-2"
                >
                    Delete
                </Trash>
            </div>
        </div>
    );
};

export default observer(FileStrip);
