import type { SrdEntry } from "../../srd/schema";
import { formatEnum } from "../display";
import { Feature, KeyValue, LinkedKeyValue, Section } from "../components/Section";

export function WeaponDetails({ entry }: { entry: Extract<SrdEntry, { kind: "weapon" }> }) {
  return (
    <Section title="Weapon Details">
      <LinkedKeyValue label="Category" field="category" value={formatEnum(entry.category)} linkValue={entry.category} />
      <KeyValue label="Tier" value={String(entry.tier)} />
      <LinkedKeyValue label="Trait" field="trait" value={formatEnum(entry.trait)} linkValue={entry.trait} />
      <LinkedKeyValue label="Range" field="range" value={formatEnum(entry.range)} linkValue={entry.range} />
      <LinkedKeyValue
        label="Damage"
        field="damageType"
        value={`${entry.damage.dice} ${formatEnum(entry.damage.type)}`}
        linkValue={entry.damage.type}
      />
      <LinkedKeyValue label="Burden" field="burden" value={formatEnum(entry.burden)} linkValue={entry.burden} />
      <KeyValue label="Requires Spellcast Trait" value={entry.requiresSpellcastTrait ? "Yes" : "No"} />
      {entry.feature ? <Feature title={entry.feature.name} text={entry.feature.text} /> : null}
    </Section>
  );
}
