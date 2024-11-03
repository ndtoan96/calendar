import { lastSunday, monthToString, nextSaturday } from "../utils";


function monthTitle(date: Date): string {
    return `${monthToString(date.getMonth() + 1)} ${date.getFullYear()}`;
}

function weekTitle(date: Date): string {
    const start = lastSunday(date);
    const end = nextSaturday(date);
    return `${monthToString(start.getMonth() + 1)} ${start.getDate()}, ${start.getFullYear()} - ${monthToString(end.getMonth() + 1)} ${end.getDate()}, ${end.getFullYear()}`;
}

function title(date: Date, displayMode: "month" | "week"): string {
    switch (displayMode) {
        case "month":
            return monthTitle(date);
        case "week":
            return weekTitle(date);
        default:
            return "";
    }
}

type Props = {
    date: Date;
    displayMode: "month" | "week";
    className?: string;
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
    onMonth: () => void;
    onWeek: () => void;
};

const lightButton = "text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700";
const darkButton = "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700";

function Header({ date, displayMode, className, onPrevious, onNext, onToday, onMonth, onWeek }: Props) {
    return (
        <header className={`flex w-full justify-between items-center p-2 ${className}`}>
            <div>
                <button className={lightButton} onClick={onPrevious}>&lt;</button>
                <button className={lightButton} onClick={onNext}>&gt;</button>
                <button className={lightButton} onClick={onToday}>Today</button>
            </div>
            <h1 className="text-2xl">{title(date, displayMode)}</h1>
            <div>
                <button className={displayMode === "month" ? darkButton : lightButton} onClick={onMonth} >Month</button>
                <button className={displayMode === "week" ? darkButton : lightButton} onClick={onWeek} >Week</button>
            </div>
        </header>
    );
}

export default Header;