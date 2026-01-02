import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ISchool } from "@BetterBac/lib/GlobalTypes";
import { db, storage } from "../../../../../../config/firebase";
import CustomTextInput from "@BetterBac/components/common/CustomTextInput";
import CustomDiv from "@BetterBac/components/common/CustomDiv";
import { useAuthStore } from "@BetterBac/state/Auth.store";
import GeneralSpinnerLoader from "@BetterBac/components/common/GeneralSpinnerLoader";
import { useTimezoneSelect, allTimezones } from "react-timezone-select"; // Import the timezone select hook
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@BetterBac/components/common/Select";
import {
    countryList,
    getCountryFlag,
} from "@BetterBac/lib/extraUtils/countries.util";
import CustomButton from "@BetterBac/components/common/CustomButton/CustomButton";
import CustomText from "@BetterBac/components/common/CustomText";
import { Checkbox } from "@BetterBac/components/common/Checkbox";
import { useSchoolStore } from "@BetterBac/state/Admin/School.store";

const SchoolProfile = () => {
    const [localSchool, setLocalSchool] = useState<ISchool | null>(null);
    const schoolStore = useSchoolStore();
    const generalStore = useGeneralStore();
    const authStore = useAuthStore();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // Loader state
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // Initialize schoolStore.localSchoolInstance with the current userSchool data
    useEffect(() => {
        if (generalStore.userSchool) {
            setLocalSchool(generalStore.userSchool);
        }
    }, [generalStore.userSchool, generalStore.activeSchoolDashboardState]);

    React.useEffect(() => {
        if (localSchool) {
            schoolStore.setLocalSchoolInstance(localSchool);
        }
    }, [localSchool]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (schoolStore.localSchoolInstance) {
            if (name.startsWith("addressObj.")) {
                const key = name.replace(
                    "addressObj.",
                    ""
                ) as keyof typeof schoolStore.localSchoolInstance.addressObj;
                schoolStore.setLocalSchoolInstance({
                    ...schoolStore.localSchoolInstance,
                    addressObj: {
                        ...schoolStore.localSchoolInstance.addressObj,
                        [key]: value,
                    },
                });
            } else {
                schoolStore.setLocalSchoolInstance({
                    ...schoolStore.localSchoolInstance,
                    [name]: value,
                });
            }
        }
    };

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            schoolStore.setLocalSchoolInstance({
                ...schoolStore.localSchoolInstance,
                photoURL: URL.createObjectURL(selectedFile),
            });
        }
    };

    // Save changes to Firestore and update generalStore
    const handleSave = async () => {
        if (schoolStore.localSchoolInstance) {
            setLoading(true); // Start loader
            try {
                let updatedPhotoURL = schoolStore.localSchoolInstance.photoURL;

                if (file) {
                    // Upload new photo to Firebase Storage
                    const userId = authStore.user.id; // Adjust according to your auth store
                    const storageRef = ref(
                        storage,
                        `schoolProfilePhotos/${schoolStore.localSchoolInstance.id}/pfp`
                    );
                    await uploadBytes(storageRef, file);
                    updatedPhotoURL = await getDownloadURL(storageRef);
                }

                // Update Firestore
                const schoolRef = doc(
                    db,
                    "schools",
                    generalStore.userSchool.id
                );
                await updateDoc(schoolRef, {
                    name: schoolStore.localSchoolInstance.name,
                    addressObj: schoolStore.localSchoolInstance.addressObj,
                    phone: schoolStore.localSchoolInstance.phone,
                    photoURL: updatedPhotoURL,
                    timezone: schoolStore.localSchoolInstance.timezone, // Include timezone
                });

                // Update generalStore after saving
                generalStore.userSchool = {
                    ...schoolStore.localSchoolInstance,
                    photoURL: updatedPhotoURL,
                };
                setFile(null); // Clear the file input after saving
            } catch (error) {
                console.error("Error saving data:", error);
            } finally {
                setLoading(false); // Stop loader
            }
        }
    };

    // Revert changes to initial data
    const handleCancel = () => {
        if (generalStore.userSchool) {
            schoolStore.setLocalSchoolInstance({ ...generalStore.userSchool });
            setFile(null); // Clear file input
        }
    };

    // Use the timezone select hook
    const { options, parseTimezone } = useTimezoneSelect({
        labelStyle: "original",
        timezones: allTimezones,
    });

    // Handle timezone selection
    const handleTimezoneSelect = (timezone: string) => {
        if (schoolStore.localSchoolInstance) {
            schoolStore.setLocalSchoolInstance({
                ...schoolStore.localSchoolInstance,
                timezone: parseTimezone(timezone).value,
            });
        }
    };

    // Handle country selection
    const handleCountrySelect = (country: string) => {
        if (schoolStore.localSchoolInstance) {
            schoolStore.setLocalSchoolInstance({
                ...schoolStore.localSchoolInstance,
                addressObj: {
                    ...schoolStore.localSchoolInstance.addressObj,
                    country,
                },
            });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            schoolStore.setLocalSchoolInstance({
                ...schoolStore.localSchoolInstance,
                photoURL: URL.createObjectURL(droppedFile),
            });
        }
    };

    return (
        <div className="w-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start px-1">
                <h2 className="text-xl font-bold">School Profile</h2>
                <div
                    className={`flex items-center justify-center gap-4 ${
                        JSON.stringify(schoolStore.localSchoolInstance) !==
                        JSON.stringify(generalStore.userSchool)
                            ? "opacity-100"
                            : "opacity-0"
                    }`}
                >
                    <CustomButton
                        isInverse
                        onClick={handleCancel}
                        addedClassname="text-xs"
                    >
                        Cancel changes
                    </CustomButton>
                    <CustomButton
                        onClick={handleSave}
                        addedClassname={`text-xs ${
                            schoolStore.localSchoolInstance?.name == "" &&
                            "opacity-10"
                        }`}
                        disabled={schoolStore.localSchoolInstance?.name == ""}
                    >
                        Save
                    </CustomButton>
                </div>
            </div>
            <hr className="mt-2 mb-6" />
            <div className="flex flex-col flex-1 h-full overflow-y-scroll overflow-x-hidden p-1">
                {loading ? (
                    <GeneralSpinnerLoader />
                ) : (
                    <div className="flex flex-col gap-4">
                        <CustomDiv>
                            <label
                                htmlFor="photo-input"
                                className="block mb-2 text-sm font-medium"
                            >
                                Logo
                            </label>
                            <div className="flex flex-col gap-4">
                                <img
                                    src={
                                        schoolStore.localSchoolInstance
                                            ?.photoURL || "/default-profile.png"
                                    }
                                    alt="School Logo"
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                                <div
                                    className={`${
                                        isDraggingOver
                                            ? "text-black border-black"
                                            : "hover:text-black hover:border-black text-gray-600"
                                    } mt-2 py-6 border-2 w-full md:w-96 border-dashed rounded-lg cursor-pointer transition-transform transform hover:scale-[1.01]`}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onDragLeave={() => setIsDraggingOver(false)}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <label
                                        htmlFor="fileInput"
                                        className="cursor-pointer flex flex-col items-center space-y-2"
                                    >
                                        <svg
                                            className="w-8 h-8"
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
                                        <span className="font-medium text-sm">
                                            Drag and drop a new logo here
                                        </span>
                                        <span className="text-xs">
                                            {" "}
                                            or click to select from your device
                                            (ideally 400px x 400px).
                                        </span>
                                    </label>
                                    <input
                                        className="hidden"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </CustomDiv>
                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="name-input"
                                className="block mb-2 text-sm font-medium"
                            >
                                Name
                            </label>
                            <CustomTextInput
                                id="name-input"
                                type="text"
                                name="name"
                                value={
                                    schoolStore.localSchoolInstance?.name || ""
                                }
                                onChange={handleInputChange}
                            />
                            {schoolStore.localSchoolInstance?.name == "" && (
                                <label
                                    htmlFor="name-input"
                                    className="block mt-2 text-xs text-red-500 font-medium"
                                >
                                    Your school's name cannot be empty! Please
                                    enter a name or cancel your changes.
                                </label>
                            )}
                        </CustomDiv>
                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="address-input"
                                className="block mb-2 text-sm font-medium"
                            >
                                Address
                            </label>
                            <CustomTextInput
                                id="address-input"
                                type="text"
                                name="addressObj.address"
                                value={
                                    schoolStore.localSchoolInstance?.addressObj
                                        .address || ""
                                }
                                onChange={handleInputChange}
                            />
                        </CustomDiv>

                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="addressTwo-input"
                                className="block mb-2 text-sm font-medium"
                            >
                                Address Line 2
                            </label>
                            <CustomTextInput
                                id="addressTwo-input"
                                type="text"
                                name="addressObj.addressTwo"
                                value={
                                    schoolStore.localSchoolInstance?.addressObj
                                        .addressTwo || ""
                                }
                                onChange={handleInputChange}
                            />
                        </CustomDiv>

                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="city-input"
                                className="block mb-2 text-sm font-medium"
                            >
                                City
                            </label>
                            <CustomTextInput
                                id="city-input"
                                type="text"
                                name="addressObj.city"
                                value={
                                    schoolStore.localSchoolInstance?.addressObj
                                        .city || ""
                                }
                                onChange={handleInputChange}
                            />
                        </CustomDiv>

                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="stateProvince-input"
                                className="block mb-2 text-sm font-medium"
                            >
                                State/Province
                            </label>
                            <CustomTextInput
                                id="stateProvince-input"
                                type="text"
                                name="addressObj.stateProvince"
                                value={
                                    schoolStore.localSchoolInstance?.addressObj
                                        .stateProvince || ""
                                }
                                onChange={handleInputChange}
                            />
                        </CustomDiv>

                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="postalCode-input"
                                className="block mb-2 text-sm font-medium"
                            >
                                Postal Code
                            </label>
                            <CustomTextInput
                                id="postalCode-input"
                                type="number"
                                name="addressObj.postalCode"
                                value={
                                    schoolStore.localSchoolInstance?.addressObj
                                        .postalCode || ""
                                }
                                onChange={handleInputChange}
                            />
                        </CustomDiv>
                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="country-select"
                                className="block mb-2 text-sm font-medium"
                            >
                                Country
                            </label>
                            <Select
                                name="country"
                                value={
                                    schoolStore.localSchoolInstance?.addressObj
                                        .country || ""
                                }
                                onValueChange={val => handleCountrySelect(val)}
                            >
                                <SelectTrigger className="w-96 font-normal text-sm">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectGroup>
                                        {countryList.map(country => (
                                            <SelectItem
                                                key={country}
                                                value={country}
                                            >
                                                {country}{" "}
                                                {getCountryFlag(country)}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </CustomDiv>
                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="timezone-select"
                                className="block mb-2 text-sm font-medium"
                            >
                                Timezone
                            </label>
                            <Select
                                name="timezone"
                                value={
                                    schoolStore.localSchoolInstance?.timezone ||
                                    ""
                                }
                                onValueChange={val => handleTimezoneSelect(val)}
                                // className="border rounded px-3 py-2"
                            >
                                <SelectTrigger className="w-96 font-normal text-sm">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectGroup>
                                        {options.map(option => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {/* <div className="flex items-center space-x-2 mt-2">
                            <Checkbox
                                id="timezone-linkage-to-country"
                                checked={true}
                                onCheckedChange={checked => null}
                            />
                            <label
                                htmlFor="timezone-linkage-to-country"
                                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Automatically link timezone to country
                            </label>
                        </div> */}{" "}
                            {/*TODO: Implement later*/}
                        </CustomDiv>

                        <CustomDiv className="max-w-96">
                            <label
                                htmlFor="phone-input"
                                className="block mb-2 text-sm font-medium"
                            >
                                Phone
                            </label>
                            <CustomTextInput
                                id="phone-input"
                                type="text"
                                name="phone"
                                value={
                                    schoolStore.localSchoolInstance?.phone || ""
                                }
                                onChange={handleInputChange}
                            />
                        </CustomDiv>
                    </div>
                )}
            </div>
        </div>
    );
};

export default observer(SchoolProfile);
