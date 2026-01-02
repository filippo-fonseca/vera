import { IUser } from "../GlobalTypes";

interface OutputFilteredUsersByIdParams {
    userArray: IUser[];
    userIds: string[];
}

/**
 * Filters an array of users to return only those whose IDs are included in the specified user IDs array.
 *
 * @param params - An object containing:
 *   - `userArray` (IUser[]): The array of users to be filtered.
 *   - `userIds` (string[]): The array of user IDs to filter by.
 *
 * @returns IUser[] - An array of users whose IDs are present in the `userIds` array.
 */
export const outputFilteredUsersById = ({
    userArray,
    userIds,
}: OutputFilteredUsersByIdParams): IUser[] => {
    return userArray?.filter(user => userIds.includes(user.id));
};
