import { Microscope, Paperclip, FlaskRound } from "lucide-react"; // Import your Lucide icons

// Define the mapping of icons to numbers
const iconMapping: { [key: number]: React.ComponentType<any> } = {
    0: Microscope,
    1: Paperclip,
    2: FlaskRound,
    // Add more icons as needed
};

export const getCourseIconFromNumber = (
    index: number
): React.ComponentType<any> => {
    // Check if the icon for the given index exists in the mapping
    const IconComponent = iconMapping[index];
    // Return the corresponding icon component or a default icon for unknown numbers
    return IconComponent;
};
