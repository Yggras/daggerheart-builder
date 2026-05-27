import type { SrdEntry } from "../../srd/schema";
import { Feature, KeyValue, Section } from "../components/Section";

export function CommunityDetails({ entry }: { entry: Extract<SrdEntry, { kind: "community" }> }) {
  return (
    <Section title="Community Details">
      <KeyValue label="Adjectives" value={entry.adjectives.join(", ")} />
      <Feature title={entry.feature.name} text={entry.feature.text} />
    </Section>
  );
}
