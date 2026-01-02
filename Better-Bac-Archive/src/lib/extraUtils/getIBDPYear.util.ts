export const getIBDPYear = (examYear: number): "Y1" | "Y2" => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-based

    const isY2 =
        (currentYear === examYear - 1 && currentMonth >= 7) ||
        (currentYear === examYear - 2 && currentMonth <= 6);

    return !isY2 ? "Y1" : "Y2";
};
