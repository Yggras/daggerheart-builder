import type { SrdEntry } from "../../srd/schema";
import { formatEnum } from "../display";
import { KeyValue, LinkedKeyValue, Section } from "../components/Section";

export function LootDetails({ entry }: { entry: Extract<SrdEntry, { kind: "loot" }> }) {
  return (
    <Section title="Loot Details">
      <LinkedKeyValue label="Type" field="lootType" value={formatEnum(entry.lootType)} linkValue={entry.lootType} />
      <KeyValue label="Roll" value={String(entry.roll).padStart(2, "0")} />
      <KeyValue label="Max Quantity" value={entry.maxQuantity ? String(entry.maxQuantity) : "Not limited"} />
    </Section>
  );
}
