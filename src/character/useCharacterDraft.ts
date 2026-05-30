import { useCallback, useEffect, useRef, useState } from "react";
import { getCharacter, saveCharacter, subscribeToStore } from "./store";
import type { Character } from "./schema";

const AUTOSAVE_DELAY_MS = 400;

// Loads a character draft by id and exposes an `update` mutator that applies changes immediately to
// local state and persists them with a debounced autosave (CBW-24). Pending saves are flushed on
// unmount so progress is never lost.
export function useCharacterDraft(id: string | undefined) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef<Character | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!id) {
      setCharacter(null);
      setLoading(false);
      return;
    }
    getCharacter(id).then((loaded) => {
      if (!active) return;
      latest.current = loaded;
      setCharacter(loaded);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (latest.current) {
      void saveCharacter(latest.current);
    }
  }, []);

  // Flush any pending save when the component unmounts.
  useEffect(() => flush, [flush]);

  // Adopt live updates the sync engine applies from other devices. Guard against clobbering an
  // active edit: ignore while a local autosave is pending, and only adopt a strictly-newer version.
  useEffect(() => {
    if (!id) return;
    return subscribeToStore((event) => {
      if (event.type === "delete") {
        if (event.id === id && !timer.current) {
          latest.current = null;
          setCharacter(null);
        }
        return;
      }
      if (event.origin !== "remote" || event.character.id !== id) return;
      if (timer.current) return; // user is mid-edit; local wins until it flushes (LWW)
      const current = latest.current;
      if (current && event.character.meta.updatedAt <= current.meta.updatedAt) return;
      latest.current = event.character;
      setCharacter(event.character);
    });
  }, [id]);

  const update = useCallback((mutate: (character: Character) => void) => {
    setCharacter((current) => {
      if (!current) return current;
      // Character is plain JSON data; a JSON clone is portable (Hermes lacks structuredClone).
      const next: Character = JSON.parse(JSON.stringify(current));
      mutate(next);
      latest.current = next;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (latest.current) void saveCharacter(latest.current);
        timer.current = null;
      }, AUTOSAVE_DELAY_MS);
      return next;
    });
  }, []);

  return { character, loading, update, flush };
}
