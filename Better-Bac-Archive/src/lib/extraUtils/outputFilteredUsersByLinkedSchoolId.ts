import { IUser } from "../GlobalTypes";

interface OutputFilteredUsersByLinkedSchoolIdParams {
    userArray: IUser[];
    linkedSchoolId: string;
}

/**
 * Filters an array of users to return only those whose `linkedSchoolId` matches the specified `linkedSchoolId`.
 *
 * @param params - An object containing:
 *   - `userArray` (IUser[]): The array of users to be filtered.
 *   - `linkedSchoolId` (string): The linked school ID to filter users by.
 *
 * @returns IUser[] - An array of users whose `linkedSchoolId` matches the specified `linkedSchoolId`.
 */
export const outputFilteredUsersByLinkedSchoolId = ({
    userArray,
    linkedSchoolId,
}: OutputFilteredUsersByLinkedSchoolIdParams): IUser[] => {
    return userArray?.filter(user => user.linkedSchoolId === linkedSchoolId);
};
