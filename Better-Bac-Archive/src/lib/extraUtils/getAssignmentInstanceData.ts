import { IAssignmentInstance } from "@BetterBac/lib/GlobalTypes";

/**
 * Finds a single assignment instance that matches the given assignment ID and student ID.
 *
 * @param assignmentInstances - Array of assignment instances to search.
 * @param linkedAssignmentId - The assignment ID to match.
 * @param linkedStudentId - The student ID to match.
 * @returns The matching assignment instance or null if no match is found.
 */

type GetAssignmentInstanceDataProps = {
    assignmentInstances: IAssignmentInstance[];
    linkedAssignmentId: string;
    linkedStudentId: string;
};
export const getAssignmentInstanceData = (
    props: GetAssignmentInstanceDataProps
): IAssignmentInstance | null => {
    return (
        props.assignmentInstances?.find(
            instance =>
                instance.linkedAssignmentId === props.linkedAssignmentId &&
                instance.linkedStudentId === props.linkedStudentId
        ) || null
    ); // Return null if no instance is found
};
