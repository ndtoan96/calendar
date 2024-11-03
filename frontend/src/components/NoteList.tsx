import { NoteData } from "../lib";

type Props = {
    noteData: NoteData[];
    startColor?: number;
    limit?: number;
    truncate?: boolean;
    onNoteClick: (note: NoteData) => void;
};

const nodeStyle = [
    "bg-yellow-500 text-white",
    "bg-blue-500 text-white",
    "bg-green-500 text-black",
    "bg-orange-500 text-white",
    "bg-amber-200 text-black",
    "bg-emerald-500 text-black",
];

export default function NoteList({ noteData, startColor = 0, limit = 5, truncate = true, onNoteClick }: Props) {
    return <div className="w-full">
        {noteData.slice(0, limit).map((note, index) => (
            <div draggable={true} key={note.id} onDragStart={(e) => e.dataTransfer.setData("text/plain", note.id.toString())} onClick={(e) => {
                e.stopPropagation();
                onNoteClick(note);
            }} className="w-full cursor-pointer hover:brightness-90">
                <p className={"text-lg w-full text-left " + (truncate ? "text-nowrap truncate " : "") + nodeStyle[(index + startColor) % nodeStyle.length]}>{note.content}</p>
            </div>
        ))}
        {noteData.length > limit && <div className="w-full">
            <p className="text-lg w-full text-center text-gray-400">...</p>
        </div>}
    </div>;
}