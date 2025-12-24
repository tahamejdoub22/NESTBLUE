"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/core/services/api-helpers";
import type { Note } from "@/interfaces/note.interface";

const NOTES_QUERY_KEY = ["notes-board"];

const STORAGE_KEY = "dashboard_notes";

function loadNotesFromStorage(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    return parsed.map((n) => ({
      ...n,
      createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
    }));
  } catch {
    return [];
  }
}

function saveNotesToStorage(notes: Note[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        notes.map((n) => ({
          ...n,
          createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
        })),
      ),
    );
  } catch {
    // ignore
  }
}

export function useNotes() {
  const queryClient = useQueryClient();

  const notesQuery = useQuery<Note[]>({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async () => {
      try {
        // Try to fetch from backend
        const notes = await notesApi.getAll();
        // Transform backend response to frontend format
        return notes.map((note: any) => ({
          id: note.id,
          content: note.content,
          color: note.color as Note["color"],
          rotation: note.rotation || 0,
          createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
        }));
      } catch (error) {
        // Fallback to localStorage if backend fails
        console.warn("Failed to fetch notes from backend, using localStorage:", error);
        return loadNotesFromStorage();
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addMutation = useMutation({
    mutationFn: async (note: Note) => {
      try {
        // Try to save to backend
        const saved = await notesApi.create({
          content: note.content,
          color: note.color,
          rotation: note.rotation,
        });
        // Transform backend response - use backend UUID
        const transformed: Note = {
          id: saved.id, // Use backend UUID, not the temporary timestamp ID
          content: saved.content,
          color: saved.color as Note["color"],
          rotation: saved.rotation || 0,
          createdAt: saved.createdAt ? new Date(saved.createdAt) : new Date(),
        };
        const current = notesQuery.data || [];
        // Remove the temporary note with timestamp ID if it exists, add the backend one
        const filtered = current.filter((n) => n.id !== note.id);
        const next = [transformed, ...filtered];
        saveNotesToStorage(next); // Also save to localStorage as backup
        return next;
      } catch (error) {
        // Fallback to localStorage - keep the timestamp ID for local-only notes
        console.warn("Failed to save note to backend, using localStorage:", error);
        const current = notesQuery.data || [];
        const next = [note, ...current];
        saveNotesToStorage(next);
        return next;
      }
    },
    onSuccess: (next) => {
      queryClient.setQueryData(NOTES_QUERY_KEY, next);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      try {
        // Optimistically update the UI
        const current = notesQuery.data || [];
        const next = current.map((n) => (n.id === id ? { ...n, content } : n));
        queryClient.setQueryData(NOTES_QUERY_KEY, next);
        saveNotesToStorage(next);
        
        // Check if this is a UUID (backend note) or timestamp (local-only note)
        // UUIDs are typically 36 characters with dashes, timestamps are numeric strings
        const isBackendNote = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (isBackendNote) {
          // Try to update in backend (fire and forget for better UX)
          notesApi.update(id, { content }).catch((error) => {
            console.warn("Failed to update note in backend:", error);
            // Revert optimistic update on error
            queryClient.setQueryData(NOTES_QUERY_KEY, current);
            saveNotesToStorage(current);
          });
        }
        // If it's a local-only note (timestamp ID), just update localStorage
        
        return next;
      } catch (error) {
        // Fallback to localStorage
        console.warn("Failed to update note, using localStorage:", error);
        const current = notesQuery.data || [];
        const next = current.map((n) => (n.id === id ? { ...n, content } : n));
        saveNotesToStorage(next);
        queryClient.setQueryData(NOTES_QUERY_KEY, next);
        return next;
      }
    },
    onSuccess: (next) => {
      queryClient.setQueryData(NOTES_QUERY_KEY, next);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Try to delete from backend
        await notesApi.delete(id);
        const current = notesQuery.data || [];
        const next = current.filter((n) => n.id !== id);
        saveNotesToStorage(next);
        return next;
      } catch (error) {
        // Fallback to localStorage
        console.warn("Failed to delete note from backend, using localStorage:", error);
        const current = notesQuery.data || [];
        const next = current.filter((n) => n.id !== id);
        saveNotesToStorage(next);
        return next;
      }
    },
    onSuccess: (next) => {
      queryClient.setQueryData(NOTES_QUERY_KEY, next);
    },
  });

  return {
    notes: notesQuery.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    addNote: addMutation.mutateAsync,
    updateNote: updateMutation.mutateAsync,
    deleteNote: deleteMutation.mutateAsync,
  };
}


