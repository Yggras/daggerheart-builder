import type { SrdEntry } from "../../srd/schema";
import { formatEnum } from "../display";
import { Feature, KeyValue, LinkedKeyValue, Section } from "../components/Section";

export function SubclassDetails({ entry }: { entry: Extract<SrdEntry, { kind: "subclass" }> }) {
  return (
    <Section title="Subclass Details">
      <KeyValue label="Class" value={entry.classId} />
      <LinkedKeyValue
        label="Spellcast Trait"
        field="trait"
        value={entry.spellcastTrait ? formatEnum(entry.spellcastTrait) : "None"}
        linkValue={entry.spellcastTrait ?? "none"}
      />
      {entry.features.foundation.map((feature) => (
        <Feature key={feature.name} title={`Foundation: ${feature.name}`} text={feature.text} />
      ))}
      {entry.features.specialization.map((feature) => (
        <Feature key={feature.name} title={`Specialization: ${feature.name}`} text={feature.text} />
      ))}
      {entry.features.mastery.map((feature) => (
        <Feature key={feature.name} title={`Mastery: ${feature.name}`} text={feature.text} />
      ))}
    </Section>
  );
}
