import { useEffect, useState } from "react";
import { isSameDay, lastSunday } from "../utils";
import NoteList from "./NoteList";
import { getNoteData, NoteData, updateNote } from "../lib";

type Props = {
    selectedDate: Date;
    onCellClick: (date: Date) => void;
    onNoteClick: (note: NoteData) => void;
    parentLastModified: number;
    guestId: number;
};

const primaryCell = "border-2 align-top text-right text-lg text-gray-700 hover:bg-slate-100";
const secondaryCell = "border-2 align-top text-right text-lg text-gray-400 bg-slate-50 hover:bg-slate-200";
const selectedCell = "bg-red-100";
const todayCell = "font-bold underline";

export default function CalendarTableMonth({ guestId, selectedDate, onCellClick, onNoteClick, parentLastModified }: Props) {
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const startCalendarDate = lastSunday(firstDayOfMonth);
    const [noteData, setNoteData] = useState<NoteData[]>([]);
    const [lastModified, setLastModified] = useState<number>(Date.now());

    useEffect(() => {
        const lastCalendarDate = new Date(startCalendarDate.getFullYear(), startCalendarDate.getMonth(), startCalendarDate.getDate() + 7 * 5 - 1);
        getNoteData(guestId, startCalendarDate, lastCalendarDate).then((data) => setNoteData(data));
    }, [selectedDate, lastModified, parentLastModified]);

    const days: Date[][] = [[], [], [], [], []];
    const today = new Date();
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 7; col++) {
            days[row][col] = new Date(startCalendarDate.getFullYear(), startCalendarDate.getMonth(), startCalendarDate.getDate() + row * 7 + col);
        }
    }

    return <div className="p-2 h-[80vh]">
        <table className="w-full h-full border-2">
            <thead className="h-4">
                <tr>
                    <th className="border-2 w-[14.2857%]">Sun</th>
                    <th className="border-2 w-[14.2857%]">Mon</th>
                    <th className="border-2 w-[14.2857%]">Tue</th>
                    <th className="border-2 w-[14.2857%]">Wed</th>
                    <th className="border-2 w-[14.2857%]">Thu</th>
                    <th className="border-2 w-[14.2857%]">Fri</th>
                    <th className="border-2 w-[14.2857%]">Sat</th>
                </tr>
            </thead>
            <tbody>
                {days.map((row, rowIdx) => <tr className="h-1/6" key={rowIdx}>
                    {row.map((date, colIdx) => <td key={colIdx} className={`${date < firstDayOfMonth || date > lastDayOfMonth
                        ? secondaryCell
                        : primaryCell} ${isSameDay(date, selectedDate) ? selectedCell : ""}`}
                        onClick={() => onCellClick(date)}
                    >
                        <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                            const id = parseInt(e.dataTransfer.getData("text/plain"));
                            const note = noteData.find(note => note.id === id)!;
                            updateNote({ id: note.id, date: date, content: note.content });
                            setLastModified(Date.now());
                        }} className="h-full min-h-20">
                            <div className="w-full">
                                <span className={isSameDay(date, today) ? todayCell : ""}>{date.getDate()}</span>
                            </div>
                            <NoteList onNoteClick={onNoteClick} startColor={colIdx} noteData={noteData.filter(note => isSameDay(note.date, date))} />
                        </div>
                    </td>)}
                </tr>)}
            </tbody>
        </table>
    </div>;
}