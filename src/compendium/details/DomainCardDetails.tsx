import type { SrdEntry } from "../../srd/schema";
import { Feature, KeyValue, Section } from "../components/Section";

export function DomainCardDetails({ entry }: { entry: Extract<SrdEntry, { kind: "domain_card" }> }) {
  return (
    <Section title="Card Details">
      <KeyValue label="Domain" value={entry.domain} />
      <KeyValue label="Level" value={String(entry.level)} />
      <KeyValue label="Type" value={entry.cardType} />
      <KeyValue label="Recall Cost" value={String(entry.recallCost)} />
      {entry.abilities.map((ability) => (
        <Feature key={ability.name} title={ability.name} text={ability.text} />
      ))}
    </Section>
  );
}
