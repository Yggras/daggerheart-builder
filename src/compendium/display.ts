import type { SrdEntry } from "../srd/schema";

export function formatKind(kind: SrdEntry["kind"]) {
  return kind
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTags(tags: string[]) {
  return tags.map((tag) => tag.replaceAll("-", " ")).join(" • ");
}
