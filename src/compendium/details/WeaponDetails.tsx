import type { SrdEntry } from "../../srd/schema";
import { Feature, KeyValue, Section } from "../components/Section";

export function WeaponDetails({ entry }: { entry: Extract<SrdEntry, { kind: "weapon" }> }) {
  return (
    <Section title="Weapon Details">
      <KeyValue label="Category" value={entry.category} />
      <KeyValue label="Tier" value={String(entry.tier)} />
      <KeyValue label="Trait" value={entry.trait} />
      <KeyValue label="Range" value={entry.range} />
      <KeyValue label="Damage" value={`${entry.damage.dice} ${entry.damage.type}`} />
      <KeyValue label="Burden" value={entry.burden} />
      <KeyValue label="Requires Spellcast Trait" value={entry.requiresSpellcastTrait ? "Yes" : "No"} />
      {entry.feature ? <Feature title={entry.feature.name} text={entry.feature.text} /> : null}
    </Section>
  );
}
