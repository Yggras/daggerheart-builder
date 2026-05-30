import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { deriveCharacter, type AttackLine } from "../engine";
import { TRAIT_NAMES, type CharacterDefinition, type TraitName } from "../schema";
import { getSrdEntryById } from "../../srd/loadFixture";
import type { SrdEntry } from "../../srd/schema";
import { colors, radii } from "../../theme";

const TRAIT_LABELS: Record<TraitName, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

export function CharacterSummary({
  characterId,
  definition,
  editable,
}: {
  characterId: string;
  definition: CharacterDefinition;
  editable?: boolean;
}) {
  const stats = deriveCharacter(definition);
  const classEntry = byKind(definition.classId, "class");
  const subclassEntry = byKind(definition.subclassId, "subclass");
  const ancestryPrimary = byKind(definition.heritage.ancestry.primaryId, "ancestry");
  const ancestrySecondary = byKind(definition.heritage.ancestry.secondaryId, "ancestry");
  const community = byKind(definition.heritage.communityId, "community");
  const armor = byKind(definition.equipment.armorId, "armor");

  return (
    <View style={styles.container}>
      <Section title="Core" step="class" characterId={characterId} editable={editable}>
        <Text style={styles.lineStrong}>{[classEntry?.name, subclassEntry?.name].filter(Boolean).join(" · ") || "No class chosen"}</Text>
        <Text style={styles.line}>Level {definition.level}</Text>
        {definition.identity.description.trim() ? <Text style={styles.body}>{definition.identity.description.trim()}</Text> : null}
      </Section>

      <Section title="Stats" step="traits" characterId={characterId} editable={editable}>
        <View style={styles.statGrid}>
          <Stat label="Evasion" value={fmt(stats.evasion)} />
          <Stat label="HP" value={fmt(stats.hpMax)} />
          <Stat label="Hope" value={String(stats.hope)} />
          <Stat label="Stress" value={String(stats.stressSlots)} />
          <Stat label="Major" value={fmt(stats.thresholds.major)} />
          <Stat label="Severe" value={fmt(stats.thresholds.severe)} />
          <Stat label="Armor" value={fmt(stats.armorScore)} />
          <Stat label="Prof" value={String(stats.proficiency)} />
        </View>
        {stats.appliedEffects.length > 0 ? (
          <Text style={styles.note}>{stats.appliedEffects.map((effect) => `+${effect.value} ${effect.label}`).join(" · ")}</Text>
        ) : null}
      </Section>

      <Section title="Traits" step="traits" characterId={characterId} editable={editable}>
        <View style={styles.statGrid}>
          {TRAIT_NAMES.map((trait) => (
            <Stat key={trait} label={TRAIT_LABELS[trait]} value={fmt(stats.traits[trait])} />
          ))}
        </View>
      </Section>

      {stats.attacks.length > 0 ? (
        <Section title="Attacks" step="equipment" characterId={characterId} editable={editable}>
          {stats.attacks.map((attack) => <AttackRow key={attack.slot} attack={attack} />)}
        </Section>
      ) : null}

      <Section title="Heritage" step="heritage" characterId={characterId} editable={editable}>
        <Text style={styles.lineStrong}>{heritageLine(ancestryPrimary, ancestrySecondary, definition.heritage.ancestry.mode)}</Text>
        <Text style={styles.line}>{community?.name ?? "No community"}</Text>
        {ancestryPrimary ? <FeatureList title="Ancestry" features={activeAncestryFeatures(definition, ancestryPrimary, ancestrySecondary)} /> : null}
        {community ? <FeatureList title="Community" features={[community.feature]} /> : null}
      </Section>

      <Section title="Class Features" step="class" characterId={characterId} editable={editable}>
        {classEntry ? <FeatureList title={classEntry.name} features={[classEntry.hopeFeature, ...classEntry.classFeatures]} /> : <Text style={styles.line}>No class features yet.</Text>}
        {subclassEntry ? <FeatureList title={subclassEntry.name} features={subclassEntry.features.foundation} /> : null}
      </Section>

      {stats.experiences.length > 0 ? (
        <Section title="Experiences" step="experiences" characterId={characterId} editable={editable}>
          {stats.experiences.map((experience) => (
            <Text key={experience.id} style={styles.line}>
              {experience.text || "Unnamed"} ({experience.modifier >= 0 ? `+${experience.modifier}` : experience.modifier})
            </Text>
          ))}
        </Section>
      ) : null}

      {definition.domainCards.length > 0 ? (
        <Section title="Domain Cards" step="domains" characterId={characterId} editable={editable}>
          {definition.domainCards.map((cardRef) => {
            const card = byKind(cardRef.cardId, "domain_card");
            return card ? <DomainCardSummary key={card.id} card={card} /> : null;
          })}
        </Section>
      ) : null}

      <Section title="Equipment" step="equipment" characterId={characterId} editable={editable}>
        {definition.equipment.primaryWeaponId ? <EquipmentLine label="Primary" id={definition.equipment.primaryWeaponId} /> : null}
        {definition.equipment.secondaryWeaponId ? <EquipmentLine label="Secondary" id={definition.equipment.secondaryWeaponId} /> : null}
        {armor ? <Text style={styles.line}>Armor: {armor.name} ({fmt(stats.thresholds.major)}/{fmt(stats.thresholds.severe)}, Score {fmt(stats.armorScore)})</Text> : null}
        {definition.equipment.chosenClassItemId ? <Text style={styles.line}>Class item: {definition.equipment.chosenClassItemId}</Text> : null}
        {definition.equipment.potion ? <Text style={styles.line}>Potion: {definition.equipment.potion === "minor_health" ? "Minor Health Potion" : "Minor Stamina Potion"}</Text> : null}
      </Section>

      <AnsweredQuestions title="Background" step="background" characterId={characterId} editable={editable} answers={definition.background.answers} />
      <AnsweredQuestions title="Connections" step="connections" characterId={characterId} editable={editable} answers={definition.connections.answers} />

      {definition.companion ? (
        <Section title="Companion" step="class" characterId={characterId} editable={editable}>
          <Text style={styles.lineStrong}>{definition.companion.name || "Unnamed companion"}</Text>
          <Text style={styles.line}>{definition.companion.animalKind || "No animal kind"} · Evasion {stats.companion?.evasion ?? "—"}</Text>
          <Text style={styles.line}>Attack: {definition.companion.attack.description || "Unnamed"} · {stats.companion?.attack.damageRoll ?? "—"} · {formatEnum(definition.companion.attack.range)}</Text>
          {definition.companion.experiences.map((experience) => (
            <Text key={experience.id} style={styles.line}>{experience.text || "Unnamed Experience"} (+{experience.modifier})</Text>
          ))}
        </Section>
      ) : null}
    </View>
  );
}

function Section({ title, step, characterId, editable, children }: { title: string; step: string; characterId: string; editable?: boolean; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {editable ? (
          <Pressable onPress={() => router.push({ pathname: "/characters/[id]/build/[step]", params: { id: characterId, step } })}>
            <Text style={styles.edit}>Edit</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AttackRow({ attack }: { attack: AttackLine }) {
  const weapon = byKind(attack.weaponId, "weapon");
  return (
    <View style={styles.subCard}>
      <Text style={styles.lineStrong}>{capitalize(attack.slot)}: {weapon?.name ?? attack.weaponId}</Text>
      <Text style={styles.line}>{attack.damageRoll ?? "—"} {formatEnum(attack.damageType)} · {formatTrait(attack.attackTrait)} {fmtMod(attack.attackModifier)} · {weapon ? formatEnum(weapon.range) : "—"}</Text>
    </View>
  );
}

function FeatureList({ title, features }: { title: string; features: Array<{ name: string; text: string }> }) {
  return (
    <View style={styles.featureGroup}>
      <Text style={styles.note}>{title}</Text>
      {features.map((feature) => (
        <View key={feature.name} style={styles.feature}>
          <Text style={styles.featureTitle}>{feature.name}</Text>
          <Text style={styles.body}>{feature.text}</Text>
        </View>
      ))}
    </View>
  );
}

function DomainCardSummary({ card }: { card: Extract<SrdEntry, { kind: "domain_card" }> }) {
  return (
    <View style={styles.subCard}>
      <Text style={styles.lineStrong}>{card.name}</Text>
      <Text style={styles.line}>{card.domain} · {formatEnum(card.cardType)} · Recall {card.recallCost}</Text>
      {card.abilities.map((ability) => (
        <View key={ability.name} style={styles.feature}>
          <Text style={styles.featureTitle}>{ability.name}</Text>
          <Text style={styles.body}>{ability.text}</Text>
        </View>
      ))}
    </View>
  );
}

function EquipmentLine({ label, id }: { label: string; id: string }) {
  const entry = getSrdEntryById(id);
  return <Text style={styles.line}>{label}: {entry?.name ?? id}</Text>;
}

function AnsweredQuestions({ title, step, characterId, editable, answers }: { title: string; step: string; characterId: string; editable?: boolean; answers: Array<{ id: string; prompt: string; answer: string }> }) {
  const answered = answers.filter((answer) => answer.answer.trim().length > 0);
  if (answered.length === 0 && !editable) return null;
  return (
    <Section title={title} step={step} characterId={characterId} editable={editable}>
      {answered.length === 0 ? <Text style={styles.line}>No answers yet.</Text> : answered.map((answer) => (
        <View key={answer.id} style={styles.subCard}>
          <Text style={styles.note}>{answer.prompt}</Text>
          <Text style={styles.body}>{answer.answer}</Text>
        </View>
      ))}
    </Section>
  );
}

function activeAncestryFeatures(
  definition: CharacterDefinition,
  primary: Extract<SrdEntry, { kind: "ancestry" }>,
  secondary: Extract<SrdEntry, { kind: "ancestry" }> | null,
) {
  if (definition.heritage.ancestry.mode === "single") return primary.features;
  return [primary.features[0], secondary?.features[1]].filter((feature): feature is { name: string; text: string } => Boolean(feature));
}

function heritageLine(
  primary: Extract<SrdEntry, { kind: "ancestry" }> | null,
  secondary: Extract<SrdEntry, { kind: "ancestry" }> | null,
  mode: string,
): string {
  if (!primary) return "No ancestry";
  return mode === "mixed" && secondary ? `${primary.name} / ${secondary.name} (Mixed)` : primary.name;
}

function byKind<K extends SrdEntry["kind"]>(id: string | null, kind: K): Extract<SrdEntry, { kind: K }> | null {
  if (!id) return null;
  const entry = getSrdEntryById(id);
  return entry?.kind === kind ? (entry as Extract<SrdEntry, { kind: K }>) : null;
}

function fmt(value: number | null): string {
  return value === null ? "—" : String(value);
}

function fmtMod(value: number | null): string {
  if (value === null) return "—";
  return value >= 0 ? `+${value}` : String(value);
}

function formatTrait(value: string): string {
  return value === "spellcast" ? "Spellcast" : formatEnum(value);
}

function formatEnum(value: string): string {
  return value
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function capitalize(value: string): string {
  return value.length > 0 ? `${value[0]!.toUpperCase()}${value.slice(1)}` : value;
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  section: { gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, backgroundColor: colors.cardBackground, padding: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  sectionTitle: { flex: 1, color: colors.textPrimary, fontSize: 20, fontWeight: "800" },
  edit: { color: colors.link, fontSize: 14, fontWeight: "800" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: { minWidth: 64, alignItems: "center", borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radii.input, backgroundColor: colors.background, paddingVertical: 9, paddingHorizontal: 10 },
  statValue: { color: colors.textPrimary, fontSize: 19, fontWeight: "800" },
  statLabel: { color: colors.textTertiary, fontSize: 10, textTransform: "capitalize" },
  subCard: { gap: 5, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 8 },
  lineStrong: { color: colors.textPrimary, fontSize: 16, fontWeight: "800", lineHeight: 22 },
  line: { color: colors.textSecondary, fontSize: 15, lineHeight: 21 },
  note: { color: colors.accentBold, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  featureGroup: { gap: 8 },
  feature: { gap: 3 },
  featureTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
});
