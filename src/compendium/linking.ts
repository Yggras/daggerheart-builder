import { srdEntries } from "../srd/loadFixture";
import type { SrdEntry } from "../srd/schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextSegment {
  type: "text" | "link";
  content: string;
  entryId?: string;
  entryKind?: SrdEntry["kind"];
}

// ---------------------------------------------------------------------------
// Linkable entry index (built once at module load)
// ---------------------------------------------------------------------------

interface LinkableEntry {
  id: string;
  name: string;
  nameLower: string;
  kind: SrdEntry["kind"];
}

const MIN_NAME_LENGTH = 8;

const singleWordBlocklist = new Set([
  "downtime",
  "evasion",
  "conditions",
  "multiclassing",
  "advancements",
]);

function isLinkable(entry: SrdEntry): boolean {
  const name = entry.name;

  if (entry.kind === "rule_reference") {
    if (name.includes(" ")) return name.length >= MIN_NAME_LENGTH;
    return !singleWordBlocklist.has(name.toLowerCase()) && name.length >= MIN_NAME_LENGTH;
  }

  return name.length >= MIN_NAME_LENGTH;
}

const linkableEntries: LinkableEntry[] = srdEntries
  .filter(isLinkable)
  .map((e) => ({ id: e.id, name: e.name, nameLower: e.name.toLowerCase(), kind: e.kind }))
  .sort((a, b) => b.name.length - a.name.length);

// ---------------------------------------------------------------------------
// Text parsing
// ---------------------------------------------------------------------------

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseTextForLinks(text: string): TextSegment[] {
  if (!text) return [{ type: "text", content: text }];

  let segments: TextSegment[] = [{ type: "text", content: text }];
  const linkedIds = new Set<string>();

  for (const entry of linkableEntries) {
    if (linkedIds.has(entry.id)) continue;

    const pattern = new RegExp(`\\b(${escapeRegex(entry.name)})\\b`, "i");
    let matched = false;

    const nextSegments: TextSegment[] = [];
    for (const seg of segments) {
      if (seg.type === "link" || matched) {
        nextSegments.push(seg);
        continue;
      }

      const match = pattern.exec(seg.content);
      if (!match) {
        nextSegments.push(seg);
        continue;
      }

      matched = true;
      const matchIndex = match.index;
      const matchLength = match[0].length;

      if (matchIndex > 0) {
        nextSegments.push({ type: "text", content: seg.content.slice(0, matchIndex) });
      }
      nextSegments.push({
        type: "link",
        content: seg.content.slice(matchIndex, matchIndex + matchLength),
        entryId: entry.id,
        entryKind: entry.kind,
      });
      if (matchIndex + matchLength < seg.content.length) {
        nextSegments.push({ type: "text", content: seg.content.slice(matchIndex + matchLength) });
      }
    }

    if (matched) {
      linkedIds.add(entry.id);
      segments = nextSegments;
    }
  }

  return segments;
}
