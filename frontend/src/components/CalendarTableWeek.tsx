import { useEffect, useState } from "react";
import { isSameDay, lastSunday, nextSaturday } from "../utils";
import NoteList from "./NoteList";
import { getNoteData, NoteData, updateNote } from "../lib";

type Props = {
    selectedDate: Date;
    onCellClick: (date: Date) => void;
    onNoteClick: (note: NoteData) => void;
    parentLastModified: number;
    guestId: number;
};

const selectedCell = "bg-red-100";
const todayCell = "font-bold underline";

export default function CalendarTableWeek({ guestId, selectedDate, onCellClick, onNoteClick, parentLastModified }: Props) {
    const startDate = lastSunday(selectedDate);
    const [noteData, setNoteData] = useState<NoteData[]>([]);
    const [lastModified, setLastModified] = useState<number>(Date.now());

    useEffect(() => {
        const endDate = nextSaturday(startDate);
        getNoteData(guestId, startDate, endDate).then((data) => {
            setNoteData(data);
        });
    }, [selectedDate, lastModified, parentLastModified]);

    const today = new Date();
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        days.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
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
                <tr className="h-5/6">
                    {days.map((date, idx) => (
                        <td
                            key={idx}
                            className={`max-w-0 max-h-0 border-2 align-top text-right text-lg text-gray-700 hover:bg-slate-100 ${isSameDay(date, selectedDate) ? selectedCell : ""}`}
                            onClick={() => onCellClick(date)}
                        >
                            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                                const id = parseInt(e.dataTransfer.getData("text/plain"));
                                const note = noteData.find(note => note.id === id)!;
                                updateNote({ id: note.id, date: date, content: note.content });
                                setLastModified(Date.now());
                            }} className="h-full min-h-40">
                                <div className="w-full">
                                    <span className={isSameDay(date, today) ? todayCell : ""}>{`${date.getDate()}${date.getDate() === 1 ? "/" + (date.getMonth() + 1) : ""}`}</span>
                                </div>
                                <NoteList onNoteClick={onNoteClick} limit={20} truncate={false} startColor={idx} noteData={noteData.filter(note => isSameDay(note.date, date))} />
                            </div>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    </div>;
};