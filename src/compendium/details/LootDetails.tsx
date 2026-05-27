import type { SrdEntry } from "../../srd/schema";
import { KeyValue, Section } from "../components/Section";

export function LootDetails({ entry }: { entry: Extract<SrdEntry, { kind: "loot" }> }) {
  return (
    <Section title="Loot Details">
      <KeyValue label="Type" value={entry.lootType} />
      <KeyValue label="Roll" value={String(entry.roll).padStart(2, "0")} />
      <KeyValue label="Max Quantity" value={entry.maxQuantity ? String(entry.maxQuantity) : "Not limited"} />
    </Section>
  );
}
