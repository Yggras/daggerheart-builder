import type { SrdEntry } from "../../srd/schema";
import { Feature, KeyValue, Section } from "../components/Section";

export function ClassDetails({ entry }: { entry: Extract<SrdEntry, { kind: "class" }> }) {
  return (
    <Section title="Class Details">
      <KeyValue label="Domains" value={entry.domains.join(", ")} />
      <KeyValue label="Starting Evasion" value={String(entry.startingEvasion)} />
      <KeyValue label="Starting Hit Points" value={String(entry.startingHitPoints)} />
      <KeyValue label="Class Items" value={entry.classItems.join(" or ")} />
      <Feature title={entry.hopeFeature.name} text={entry.hopeFeature.text} />
      {entry.classFeatures.map((feature) => (
        <Feature key={feature.name} title={feature.name} text={feature.text} />
      ))}
    </Section>
  );
}
