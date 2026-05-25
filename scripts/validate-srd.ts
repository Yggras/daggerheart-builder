import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ZodError } from "zod";
import { fixtureEntries } from "../src/srd/fixtureEntries";
import { SrdEntryCollectionSchema } from "../src/srd/schema";

const inputPath = process.argv[2];
const targetPath = inputPath ? resolve(process.cwd(), inputPath) : null;
const targetLabel = inputPath ?? "data/srd/fixtures/*.json";

try {
  const parsed = targetPath ? (JSON.parse(await readFile(targetPath, "utf8")) as unknown) : fixtureEntries;
  const entries = SrdEntryCollectionSchema.parse(parsed);

  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Validated ${entries.length} SRD entries from ${targetLabel}.`);
  for (const [kind, count] of Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`- ${kind}: ${count}`);
  }
} catch (error) {
  if (error instanceof ZodError) {
    console.error("SRD validation failed:");
    for (const issue of error.issues) {
      const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
      console.error(`- ${path}: ${issue.message}`);
    }
    process.exit(1);
  }

  throw error;
}
