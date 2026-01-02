import React from "react";
import DEFAULTIcon from "@BetterBac/app/icons/FileIcons/DEFAULT.icon";
import DOCXIcon from "@BetterBac/app/icons/FileIcons/DOCX.icon";
import JPGIcon from "@BetterBac/app/icons/FileIcons/JPG.icon";
import PDFIcon from "@BetterBac/app/icons/FileIcons/PDF.icon";
import PNGIcon from "@BetterBac/app/icons/FileIcons/PNG.icon";
import POWERPOINTIcon from "@BetterBac/app/icons/FileIcons/POWERPOINT.icon";

type FileIconRendererProps = {
    type: string;
    isSmall?: boolean;
};

export const fileIconRenderer: React.FC<FileIconRendererProps> = ({
    type,
    isSmall,
}) => {
    const size = isSmall ? 24 : 32;
    switch (type) {
        case "pdf":
            return <PDFIcon width={size} height={size} />;
        case "docx":
            return <DOCXIcon width={size} height={size} />;
        case "png":
            return <PNGIcon width={size} height={size} />;
        case "jpg":
        case "jpeg":
            return <JPGIcon width={size} height={size} />;
        case "pptx":
        case "ppt":
            return <POWERPOINTIcon width={size} height={size} />;
        default:
            return <DEFAULTIcon width={size} height={size} />;
    }
};
