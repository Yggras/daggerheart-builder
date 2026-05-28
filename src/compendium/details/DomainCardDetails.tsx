import type { SrdEntry } from "../../srd/schema";
import { formatEnum } from "../display";
import { Feature, KeyValue, LinkedKeyValue, Section } from "../components/Section";

export function DomainCardDetails({ entry }: { entry: Extract<SrdEntry, { kind: "domain_card" }> }) {
  return (
    <Section title="Card Details">
      <LinkedKeyValue label="Domain" field="domain" value={entry.domain} linkValue={entry.domain} />
      <KeyValue label="Level" value={String(entry.level)} />
      <LinkedKeyValue label="Type" field="cardType" value={formatEnum(entry.cardType)} linkValue={entry.cardType} />
      <KeyValue label="Recall Cost" value={String(entry.recallCost)} />
      {entry.abilities.map((ability) => (
        <Feature key={ability.name} title={ability.name} text={ability.text} />
      ))}
    </Section>
  );
}
