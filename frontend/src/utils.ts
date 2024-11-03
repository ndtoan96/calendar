export function monthToString(month: number): string {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return monthNames[month - 1] || "Invalid month";
}

export function lastSunday(date: Date): Date {
    const today = new Date(date);
    const diff = today.getDay();
    const lastSunday = new Date(today.setDate(today.getDate() - diff));
    return lastSunday;
}

export function nextSaturday(date: Date): Date {
    const today = new Date(date);
    const diff = 6 - today.getDay();
    const nextSaturday = new Date(today.setDate(today.getDate() + diff));
    return nextSaturday;
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function toYearMonthDay(date: Date): string {
    return `${date.getFullYear()}-${
        (date.getMonth() + 1).toString().padStart(2, "0")
    }-${date.getDate().toString().padStart(2, "0")}`;
}
