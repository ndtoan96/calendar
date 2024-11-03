import { useEffect, useState } from "react";
import Header from "./components/Header";
import CalendarTableMonth from "./components/CalendarTableMonth";
import CalendarTableWeek from "./components/CalendarTableWeek";
import { addNote, createGuest, deleteNote, updateNote } from "./lib";
import NoteEditModal from "./components/NoteEditModal";

type EditStatus = {
  content: string;
  date: Date;
  id?: number;
};

function App() {
  const [displayMode, setDisplayMode] = useState<"month" | "week">("month");
  const [date, setDate] = useState(new Date());
  const [editStatus, setEditStatus] = useState<null | EditStatus>(null);
  const [lastModified, setLastModified] = useState(Date.now());
  const [guestId, setGuestId] = useState<number | null>(localStorage.getItem("guestId") ? parseInt(localStorage.getItem("guestId")!) : null);

  useEffect(() => {
    if (!guestId) {
      createGuest().then((id) => {
        localStorage.setItem("guestId", id.toString());
        setGuestId(id);
      });
    }
  }, [guestId]);

  const onPrevious = () => {
    switch (displayMode) {
      case "month":
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
        break;
      case "week":
        setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7));
        break;
    }
  };

  const onNext = () => {
    switch (displayMode) {
      case "month":
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
        break;
      case "week":
        setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7));
        break;
    }
  };

  const onSaveNote = (date: Date, content: string, id?: number) => {
    if (id) {
      updateNote({ id, date, content }).then(() => setLastModified(Date.now()));
    } else {
      addNote(guestId!, date, content).then(() => setLastModified(Date.now()));
    }
    setEditStatus(null);
  };

  const onDeleteNote = (id: number) => {
    setEditStatus(null);
    deleteNote(id).then(() => setLastModified(Date.now()));
  };

  return guestId ? <>
    <Header
      displayMode={displayMode}
      date={date}
      onMonth={() => setDisplayMode("month")}
      onWeek={() => setDisplayMode("week")}
      onToday={() => setDate(new Date())}
      onNext={onNext}
      onPrevious={onPrevious}
    />
    {displayMode === "month" && <CalendarTableMonth guestId={guestId} parentLastModified={lastModified} onNoteClick={(note) => setEditStatus({ ...note })} selectedDate={date} onCellClick={setDate} />}
    {displayMode === "week" && <CalendarTableWeek guestId={guestId} parentLastModified={lastModified} onNoteClick={(note) => setEditStatus({ ...note })} selectedDate={date} onCellClick={setDate} />}
    <div className="fixed bottom-8 right-8">
      <button onClick={() => setEditStatus({ date, content: "" })} className="bg-blue-500 hover:bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg shadow-gray-400 inline-flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
    {editStatus && <NoteEditModal onDelete={onDeleteNote} initialDate={editStatus.date} content={editStatus.content} id={editStatus.id} onSave={onSaveNote} onCancel={() => setEditStatus(null)} />}
  </>
    : <></>;
}

export default App;
