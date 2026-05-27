import type { SrdEntry } from "../../srd/schema";
import { Feature, Section } from "../components/Section";

export function AncestryDetails({ entry }: { entry: Extract<SrdEntry, { kind: "ancestry" }> }) {
  return (
    <Section title="Ancestry Details">
      {entry.features.map((feature) => (
        <Feature key={feature.name} title={feature.name} text={feature.text} />
      ))}
    </Section>
  );
}
