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

export function formatSource(entry: SrdEntry) {
  const pdfPages =
    entry.source.pdf.pageStart === entry.source.pdf.pageEnd
      ? `${entry.source.pdf.pageStart}`
      : `${entry.source.pdf.pageStart}-${entry.source.pdf.pageEnd}`;
  const printedPages = entry.source.printedPages.join(", ");

  return `PDF page ${pdfPages}; printed page${entry.source.printedPages.length === 1 ? "" : "s"} ${printedPages}`;
}
