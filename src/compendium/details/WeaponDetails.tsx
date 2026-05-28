import type { SrdEntry } from "../../srd/schema";
import { Feature, KeyValue, LinkedKeyValue, Section } from "../components/Section";

function formatEnum(s: string) {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function WeaponDetails({ entry }: { entry: Extract<SrdEntry, { kind: "weapon" }> }) {
  return (
    <Section title="Weapon Details">
      <LinkedKeyValue label="Category" value={formatEnum(entry.category)} linkValue={entry.category} />
      <KeyValue label="Tier" value={String(entry.tier)} />
      <LinkedKeyValue label="Trait" value={formatEnum(entry.trait)} linkValue={entry.trait} />
      <LinkedKeyValue label="Range" value={formatEnum(entry.range)} linkValue={entry.range} />
      <LinkedKeyValue
        label="Damage"
        value={`${entry.damage.dice} ${formatEnum(entry.damage.type)}`}
        linkValue={entry.damage.type}
      />
      <LinkedKeyValue label="Burden" value={formatEnum(entry.burden)} linkValue={entry.burden} />
      <KeyValue label="Requires Spellcast Trait" value={entry.requiresSpellcastTrait ? "Yes" : "No"} />
      {entry.feature ? <Feature title={entry.feature.name} text={entry.feature.text} /> : null}
    </Section>
  );
}
