import { isSameDay, toYearMonthDay } from "./utils";

const SERVER = "";

export type NoteData = {
    id: number;
    date: Date;
    content: string;
};

type RangeNoteData = {
    start: Date;
    end: Date;
    notes: NoteData[];
};

const clientData: RangeNoteData[] = [];

function joinData(data1: NoteData[], data2: NoteData[]): NoteData[] {
    const existed = new Set<number>(data1.map((note) => note.id));
    for (const note of data2) {
        if (!existed.has(note.id)) {
            data1.push(note);
        }
    }
    return data1;
}

function datePlusOne(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function dateMinusOne(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
}

function updateCache(
    { notes: data, start: startDate, end: endDate }: RangeNoteData,
) {
    for (let i = 0; i < clientData.length; i++) {
        let entry = clientData[i];
        if (
            startDate < entry.start &&
            endDate >= dateMinusOne(entry.start) &&
            endDate <= entry.end
        ) {
            clientData[i] = {
                start: startDate,
                end: entry.end,
                notes: joinData(data, entry.notes),
            };
            return;
        } else if (
            startDate >= entry.start &&
            startDate < datePlusOne(entry.end) && endDate > entry.end
        ) {
            clientData[i] = {
                start: entry.start,
                end: endDate,
                notes: joinData(data, entry.notes),
            };
            return;
        } else if (
            startDate < entry.start && endDate > entry.end
        ) {
            clientData[i] = {
                start: startDate,
                end: endDate,
                notes: data,
            };
            return;
        } else if (startDate >= entry.start && endDate <= entry.end) {
            return;
        }
    }
    clientData.push({ start: startDate, end: endDate, notes: data });
}

export async function getNoteData(
    guestId: number,
    startDate: Date,
    endDate: Date,
): Promise<NoteData[]> {
    for (let entry of clientData) {
        if (startDate >= entry.start && endDate <= entry.end) {
            return entry.notes.filter((note) => {
                return (note.date > startDate ||
                    isSameDay(note.date, startDate)) &&
                    (note.date < endDate || isSameDay(note.date, endDate));
            });
        }
    }

    const res = await fetch(
        `${SERVER}/api/notes?start=${toYearMonthDay(startDate)}&end=${
            toYearMonthDay(endDate)
        }&guest_id=${guestId}`,
    );
    const data: { id: number; date: string; content: string }[] = await res
        .json();
    const noteData = data.map((note) => {
        return {
            id: note.id,
            date: new Date(note.date),
            content: note.content,
        };
    });
    updateCache({ start: startDate, end: endDate, notes: noteData });
    return noteData;
}

export async function updateNote(note: NoteData) {
    for (let entry of clientData) {
        for (let i = 0; i < entry.notes.length; i++) {
            if (entry.notes[i].id === note.id) {
                entry.notes[i] = note;
                break;
            }
        }
    }
    await fetch(`${SERVER}/api/notes/${note.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            date: toYearMonthDay(note.date),
            content: note.content,
        }),
    });
}

export async function addNote(guestId: number, date: Date, content: string) {
    const res = await fetch(`${SERVER}/api/notes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            date: toYearMonthDay(date),
            content,
            guest_id: guestId,
        }),
    });
    const data = await res.json();

    for (let entry of clientData) {
        if (
            (entry.start < date || isSameDay(entry.start, date)) &&
            (entry.end > date || isSameDay(entry.end, date))
        ) {
            entry.notes.push({ id: data.id, date, content });
            break;
        }
    }
}

export async function deleteNote(noteId: number): Promise<void> {
    for (let entry of clientData) {
        for (let i = 0; i < entry.notes.length; i++) {
            if (entry.notes[i].id === noteId) {
                entry.notes.splice(i, 1);
                break;
            }
        }
    }
    await fetch(`${SERVER}/api/notes/${noteId}`, {
        method: "DELETE",
    });
}

export async function createGuest(): Promise<number> {
    const res = await fetch(`${SERVER}/api/guests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });
    const data = await res.json();
    console.log(`Created guest ${data.id}`);
    return data.id;
}
