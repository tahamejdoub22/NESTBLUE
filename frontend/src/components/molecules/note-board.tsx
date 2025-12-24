"use client";

import { renderNoteBoard } from "@/template/component/molecules/note-board.template";
import { Note } from "@/interfaces/note.interface";
import { useNotes } from "@/hooks/use-notes";

export interface NoteBoardProps {
  className?: string;
  maxNotes?: number;
}

export function NoteBoard({ className, maxNotes = 6 }: NoteBoardProps) {
  const { notes, isLoading, addNote, deleteNote, updateNote } = useNotes();

  const handleAddNote = async () => {
    const colors: Note["color"][] = ["yellow", "blue", "green", "pink"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomRotation = (Math.random() - 0.5) * 4; // -2 to 2 degrees

    const newNote: Note = {
      id: Date.now().toString(),
      content: "",
      createdAt: new Date(),
      color: randomColor,
      rotation: randomRotation,
    };

    if (notes.length >= maxNotes) return;
    await addNote(newNote);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
  };

  const handleNoteChange = async (id: string, content: string) => {
    await updateNote({ id, content });
  };

  const effectiveNotes = isLoading && notes.length === 0
    ? []
    : notes.slice(0, maxNotes);

  return renderNoteBoard({
    notes: effectiveNotes,
    maxNotes,
    className,
    onAddNote: handleAddNote,
    onDeleteNote: handleDeleteNote,
    onNoteChange: handleNoteChange,
  });
}
