import { supabase } from "../../supabase/client";
import { CharacterSchema, type Character } from "../schema";

// Supabase I/O for the `characters` table plus row<->Character mapping. The `data` JSONB column holds
// the full Character and is the source of truth on pull; the scalar columns exist for RLS, indexing,
// and ordering. See supabase/schema.sql.

const TABLE = "characters";

export type CharacterRow = {
  id: string;
  owner_id: string;
  status: string;
  schema_version: number;
  srd_version: string;
  updated_at: string;
  data: unknown;
};

export function characterToRow(character: Character, ownerId: string): CharacterRow {
  return {
    id: character.id,
    owner_id: ownerId,
    status: character.meta.status,
    schema_version: character.meta.schemaVersion,
    srd_version: character.meta.srdVersion,
    updated_at: character.meta.updatedAt,
    data: character,
  };
}

/** Parse a row's `data` blob into a Character, or null if it fails validation. */
export function rowToCharacter(row: Pick<CharacterRow, "id" | "data">): Character | null {
  const result = CharacterSchema.safeParse(row.data);
  if (!result.success) {
    console.warn(`Sync: skipping invalid remote character ${row.id}.`, result.error.issues);
    return null;
  }
  return result.data;
}

export async function upsertRemote(character: Character, ownerId: string): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(characterToRow(character, ownerId), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteRemote(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAllRemote(ownerId: string): Promise<Character[]> {
  const { data, error } = await supabase.from(TABLE).select("id, data").eq("owner_id", ownerId);
  if (error) throw error;
  const characters: Character[] = [];
  for (const row of data ?? []) {
    const character = rowToCharacter(row as Pick<CharacterRow, "id" | "data">);
    if (character) characters.push(character);
  }
  return characters;
}
