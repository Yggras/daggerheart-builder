import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { srdEntries } from "../srd/loadFixture";
import { CharacterSchema, createCharacter, type Character } from "./schema";

// Local-first persistence for user-owned characters (CBW-4). v1 stores the whole collection under a
// single AsyncStorage key as a { [id]: Character } map; values are Zod-validated on read and write.
// No Supabase in v1, but the model is shaped for future sync.

const STORAGE_KEY = "daggerheart.characters.v1";

// Stamped onto each character so we can detect drift if the bundled SRD data changes (CBW-16).
export const SRD_VERSION = srdEntries[0]?.source.version ?? "unknown";

type CharacterMap = Record<string, Character>;

async function readMap(): Promise<CharacterMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn("Character store: stored data was not valid JSON; starting empty.");
    return {};
  }

  const map: CharacterMap = {};
  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    const result = CharacterSchema.safeParse(value);
    if (result.success) {
      map[id] = result.data;
    } else {
      console.warn(`Character store: skipping invalid character ${id}.`, result.error.issues);
    }
  }
  return map;
}

async function writeMap(map: CharacterMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** All saved characters, newest-updated first. */
export async function listCharacters(): Promise<Character[]> {
  const map = await readMap();
  return Object.values(map).sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt));
}

export async function getCharacter(id: string): Promise<Character | null> {
  const map = await readMap();
  return map[id] ?? null;
}

/** Create and persist a new draft character; returns the created record. */
export async function createDraftCharacter(): Promise<Character> {
  const character = createCharacter({ id: Crypto.randomUUID(), srdVersion: SRD_VERSION });
  const map = await readMap();
  map[character.id] = character;
  await writeMap(map);
  return character;
}

/** Validate and persist a character, bumping `updatedAt`. */
export async function saveCharacter(character: Character): Promise<Character> {
  const next: Character = { ...character, meta: { ...character.meta, updatedAt: new Date().toISOString() } };
  const validated = CharacterSchema.parse(next);
  const map = await readMap();
  map[validated.id] = validated;
  await writeMap(map);
  return validated;
}

/** Load a character, apply a mutation, and persist the result. */
export async function updateCharacter(id: string, mutate: (character: Character) => void): Promise<Character> {
  const map = await readMap();
  const existing = map[id];
  if (!existing) throw new Error(`Character not found: ${id}`);
  mutate(existing);
  return saveCharacter(existing);
}

export async function deleteCharacter(id: string): Promise<void> {
  const map = await readMap();
  delete map[id];
  await writeMap(map);
}
