import { readFile } from "node:fs/promises";
import { ZodError } from "zod";
import { SrdEntryCollectionSchema } from "../src/srd/schema.js";

const fixturePath = new URL("../data/srd/fixtures/entries.json", import.meta.url);

try {
  const raw = await readFile(fixturePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  const entries = SrdEntryCollectionSchema.parse(parsed);

  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Validated ${entries.length} SRD fixture entries.`);
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
