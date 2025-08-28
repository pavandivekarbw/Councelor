import moment from "moment";

export const getLocalDateFromUTC = (
    date: string | null | undefined
): string => {
    if (!date) return "N/A";
    return moment.utc(date).local().format("YYYY-MM-DD HH:mm A");
};

export const getUTCDateFromLocal = (
    date: string | null | undefined
): string => {
    if (!date) return "";
    return moment(date, "YYYY-MM-DD HH:mm:ss")
        .utc()
        .format("YYYY-MM-DD HH:mm:ss.SSS");
};
