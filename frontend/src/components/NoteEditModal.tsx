import { useRef, useState } from "react";
import { isSameDay, toYearMonthDay } from "../utils";

type Props = {
    id?: number;
    content: string;
    initialDate: Date;
    onSave: (date: Date, content: string, id?: number) => void;
    onCancel: () => void;
    onDelete: (id: number) => void;
};

export default function NoteEditModal({ id, content, initialDate, onCancel, onSave, onDelete }: Props) {
    const [date, setDate] = useState(initialDate);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isChanged, setIsChanged] = useState(false);

    const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value ? new Date(e.target.value) : new Date();
        setDate(newDate);
        if (!isSameDay(newDate, initialDate)) {
            setIsChanged(true);
        } else if (textAreaRef.current && textAreaRef.current.value === content) {
            setIsChanged(false);
        }
    };

    const onTextAreaChange = () => {
        if (textAreaRef.current && textAreaRef.current.value !== content) {
            setIsChanged(true);
        } else if (textAreaRef.current && textAreaRef.current.value === content && isSameDay(date, initialDate)) {
            setIsChanged(false);
        }
    };

    return <div onClick={onCancel} className="flex w-screen h-screen items-center justify-center z-10 fixed top-0 left-0 bg-slate-400 bg-opacity-50">
        <div className="bg-white rounded-lg p-4 w-[40%]">
            <form onClick={(e) => e.stopPropagation()} className="max-w-sm mx-auto">
                <div className="flex">
                    <div className="mb-6 w-fit">
                        <label htmlFor="date" className="block mb-2 text-sm font-bold text-gray-900 dark:text-white">Date</label>
                        <input name="date" className="p-2" type="date" onChange={onDateChange} value={toYearMonthDay(date)} />
                    </div>
                    <div className="flex items-start justify-end w-full">
                        <button type="button" onClick={() => onDelete(id!)} disabled={!id} className={id ? "fill-orange-400" : "hidden"}>
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 64 64">
                                <path d="M 28 6 C 25.791 6 24 7.791 24 10 L 24 12 L 23.599609 12 L 10 14 L 10 17 L 54 17 L 54 14 L 40.400391 12 L 40 12 L 40 10 C 40 7.791 38.209 6 36 6 L 28 6 z M 28 10 L 36 10 L 36 12 L 28 12 L 28 10 z M 12 19 L 14.701172 52.322266 C 14.869172 54.399266 16.605453 56 18.689453 56 L 45.3125 56 C 47.3965 56 49.129828 54.401219 49.298828 52.324219 L 51.923828 20 L 12 19 z M 20 26 C 21.105 26 22 26.895 22 28 L 22 51 L 19 51 L 18 28 C 18 26.895 18.895 26 20 26 z M 32 26 C 33.657 26 35 27.343 35 29 L 35 51 L 29 51 L 29 29 C 29 27.343 30.343 26 32 26 z M 44 26 C 45.105 26 46 26.895 46 28 L 45 51 L 42 51 L 42 28 C 42 26.895 42.895 26 44 26 z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="mb-6">
                    <label htmlFor="content" className="block mb-2 text-sm font-bold text-gray-900 dark:text-white">Note</label>
                    <textarea onChange={onTextAreaChange} name="content" ref={textAreaRef} id="content" rows={10} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        defaultValue={content} />
                </div>
                <div className="flex justify-end p-2 w-full">
                    <button type="button" className="w-20 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" onClick={onCancel}>Cancel</button>
                    {isChanged
                        ? <button type="button" className="w-20 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => onSave(date, textAreaRef.current!.value, id)}>Save</button>
                        : <button type="button" disabled={true} className="w-20 text-slate-600 bg-slate-400 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2" onClick={() => onSave(date, textAreaRef.current!.value, id)}>Save</button>
                    }

                </div>
            </form>
        </div >
    </div >;
}