/**
 * Determines the current school year based on the start and end months.
 *
 * @param startMonth - The starting month of the school year (0 for January, 11 for December).
 * @param endMonth - The ending month of the school year (0 for January, 11 for December).
 *                    If less than startMonth, it indicates that the school year spans two calendar years.
 * @returns A string representing the current school year in the format "YYYY-YY".
 */
export const getCurrentSchoolYear = (
    startMonth: number,
    endMonth: number
): string => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-based month index
    const currentYear = now.getFullYear();

    let schoolYearStart: number;
    let schoolYearEnd: number;

    if (startMonth <= endMonth) {
        // School year within the same calendar year
        if (currentMonth >= startMonth && currentMonth <= endMonth) {
            schoolYearStart = currentYear;
            schoolYearEnd = currentYear + 1;
        } else if (currentMonth < startMonth) {
            schoolYearStart = currentYear - 1;
            schoolYearEnd = currentYear;
        } else {
            schoolYearStart = currentYear;
            schoolYearEnd = currentYear + 1;
        }
    } else {
        // School year spans across two calendar years
        if (currentMonth >= startMonth || currentMonth <= endMonth) {
            schoolYearStart = currentYear;
            schoolYearEnd = currentYear + 1;
        } else if (currentMonth < startMonth) {
            schoolYearStart = currentYear - 1;
            schoolYearEnd = currentYear;
        } else {
            schoolYearStart = currentYear;
            schoolYearEnd = currentYear + 1;
        }
    }

    return `${schoolYearStart}-${schoolYearEnd.toString().slice(-2)}`;
};
