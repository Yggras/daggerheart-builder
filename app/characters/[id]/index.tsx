import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { deriveCharacter } from "../../../src/character/engine";
import { useCharacterDraft } from "../../../src/character/useCharacterDraft";
import { TRAIT_NAMES } from "../../../src/character/schema";
import { getSrdEntryById } from "../../../src/srd/loadFixture";
import { colors, radii } from "../../../src/theme";

// Read-only character sheet (v1). Editing = reopening the wizard. Enriched in M6.
export default function CharacterSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { character, loading } = useCharacterDraft(id);

  if (loading) return <Centered text="Loading…" />;
  if (!character) return <Centered text="Character not found." />;

  const def = character.definition;
  const stats = deriveCharacter(def);
  const className = def.classId ? getSrdEntryById(def.classId)?.name ?? null : null;
  const subclassName = def.subclassId ? getSrdEntryById(def.subclassId)?.name ?? null : null;
  const fmt = (value: number | null) => (value === null ? "—" : String(value));

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: def.identity.name.trim() || "Character" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{def.identity.name.trim() || "Unnamed character"}</Text>
        <Text style={styles.sub}>
          {[className, subclassName].filter(Boolean).join(" · ") || "No class"} • Level {def.level}
        </Text>

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

        <Section title="Traits">
          <View style={styles.statGrid}>
            {TRAIT_NAMES.map((trait) => (
              <Stat key={trait} label={trait} value={fmt(stats.traits[trait])} />
            ))}
          </View>
        </Section>

        <Section title="Heritage">
          <Text style={styles.lineItem}>{heritageLine(def)}</Text>
        </Section>

        {stats.experiences.length > 0 ? (
          <Section title="Experiences">
            {stats.experiences.map((experience) => (
              <Text key={experience.id} style={styles.lineItem}>
                {experience.text || "Unnamed"} ({experience.modifier >= 0 ? `+${experience.modifier}` : experience.modifier})
              </Text>
            ))}
          </Section>
        ) : null}

        {def.domainCards.length > 0 ? (
          <Section title="Domain Cards">
            {def.domainCards.map((card) => (
              <Text key={card.cardId} style={styles.lineItem}>
                {nameOf(card.cardId)}
              </Text>
            ))}
          </Section>
        ) : null}

        <Section title="Equipment">
          {[def.equipment.primaryWeaponId, def.equipment.secondaryWeaponId, def.equipment.armorId]
            .filter((value): value is string => Boolean(value))
            .map((entryId) => (
              <Text key={entryId} style={styles.lineItem}>
                {nameOf(entryId)}
              </Text>
            ))}
          {def.equipment.chosenClassItemId ? (
            <Text style={styles.lineItem}>{def.equipment.chosenClassItemId}</Text>
          ) : null}
          {def.equipment.potion ? (
            <Text style={styles.lineItem}>{def.equipment.potion === "minor_health" ? "Minor Health Potion" : "Minor Stamina Potion"}</Text>
          ) : null}
        </Section>

        {stats.companion ? (
          <Section title="Companion">
            <Text style={styles.lineItem}>
              {def.companion?.name || "Unnamed"} ({def.companion?.animalKind || "companion"}) · Evasion {stats.companion.evasion} · {stats.companion.attack.damageRoll ?? "—"}
            </Text>
          </Section>
        ) : null}

        <Text style={styles.edit} onPress={() => router.push({ pathname: "/characters/[id]/build", params: { id } })}>
          Edit in builder →
        </Text>
      </ScrollView>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.centeredText}>{text}</Text>
    </View>
  );
}

function nameOf(id: string): string {
  return getSrdEntryById(id)?.name ?? id;
}

function heritageLine(def: { heritage: { communityId: string | null; ancestry: { mode: string; primaryId: string | null; secondaryId: string | null } } }): string {
  const { mode, primaryId, secondaryId } = def.heritage.ancestry;
  const ancestry = primaryId
    ? mode === "mixed" && secondaryId
      ? `${nameOf(primaryId)} / ${nameOf(secondaryId)} (Mixed)`
      : nameOf(primaryId)
    : "No ancestry";
  const community = def.heritage.communityId ? nameOf(def.heritage.communityId) : "No community";
  return `${ancestry} · ${community}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  name: { color: colors.textPrimary, fontSize: 30, fontWeight: "800" },
  sub: { color: colors.textSecondary, fontSize: 16 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: {
    minWidth: 64,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    backgroundColor: colors.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statValue: { color: colors.textPrimary, fontSize: 20, fontWeight: "800" },
  statLabel: { color: colors.textTertiary, fontSize: 11, textTransform: "capitalize" },
  section: { gap: 10 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  lineItem: { color: colors.textSecondary, fontSize: 15, lineHeight: 21 },
  edit: { color: colors.accentBold, fontSize: 16, fontWeight: "700", paddingVertical: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  centeredText: { color: colors.textSecondary, fontSize: 16 },
});
