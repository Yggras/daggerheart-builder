import type { SrdEntry } from "../../srd/schema";
import { KeyValue, Section } from "../components/Section";

export function RuleReferenceDetails({ entry }: { entry: Extract<SrdEntry, { kind: "rule_reference" }> }) {
  return (
    <Section title="Rule Details">
      <KeyValue label="Category" value={entry.category} />
      <KeyValue label="Headings" value={entry.headings.join(" > ")} />
    </Section>
  );
}
