// lib/utils.ts
import { IAssignment } from "@BetterBac/lib/GlobalTypes";

/**
 * Finds an assignment that matches the given assignment ID.
 *
 * @param activeCourseAssignments - Array of active course assignments to search.
 * @param linkedAssignmentId - The assignment ID to match.
 * @returns The matching assignment or null if no match is found.
 */
type FindAssignmentByIdProps = {
    activeCourseAssignments: IAssignment[];
    linkedAssignmentId: string;
};

export const findAssignmentById = (
    props: FindAssignmentByIdProps
): IAssignment | null => {
    return (
        props.activeCourseAssignments.find(
            assignment => assignment.id === props.linkedAssignmentId
        ) || null
    ); // Return null if no assignment is found
};
