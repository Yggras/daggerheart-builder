import type { SrdEntry } from "../../srd/schema";
import { Feature, KeyValue, Section, formatThresholds } from "../components/Section";

export function ArmorDetails({ entry }: { entry: Extract<SrdEntry, { kind: "armor" }> }) {
  return (
    <Section title="Armor Details">
      <KeyValue label="Tier" value={String(entry.tier)} />
      <KeyValue label="Levels" value={`${entry.levelRange.min}-${entry.levelRange.max}`} />
      <KeyValue label="Base Thresholds" value={formatThresholds(entry.baseThresholds)} />
      <KeyValue label="Base Score" value={String(entry.baseScore)} />
      {entry.feature ? <Feature title={entry.feature.name} text={entry.feature.text} /> : null}
    </Section>
  );
}
