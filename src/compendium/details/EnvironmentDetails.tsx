import type { SrdEntry } from "../../srd/schema";
import { formatEnum } from "../display";
import { Feature, KeyValue, LinkedKeyValue, Section } from "../components/Section";

export function EnvironmentDetails({ entry }: { entry: Extract<SrdEntry, { kind: "environment" }> }) {
  return (
    <Section title="Environment Details">
      <KeyValue label="Tier" value={String(entry.tier)} />
      <LinkedKeyValue
        label="Type"
        field="environmentType"
        value={formatEnum(entry.environmentType)}
        linkValue={entry.environmentType}
      />
      <KeyValue label="Difficulty" value={String(entry.difficulty)} />
      <KeyValue label="Impulses" value={entry.impulses.join(", ")} />
      {entry.features.map((feature) => (
        <Feature key={feature.name} title={feature.name} text={feature.text} />
      ))}
    </Section>
  );
}
