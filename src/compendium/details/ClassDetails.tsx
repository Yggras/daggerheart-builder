import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getSrdEntryById } from "../../srd/loadFixture";
import type { SrdEntry } from "../../srd/schema";
import { colors, radii } from "../../theme";
import { Feature, KeyValue, LinkedKeyValueList, Section } from "../components/Section";

type SubclassEntry = Extract<SrdEntry, { kind: "subclass" }>;

function SubclassCard({ entry }: { entry: SubclassEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.subclassCard}>
      <Pressable onPress={() => setExpanded((v) => !v)} style={styles.subclassHeader}>
        <View style={styles.subclassHeaderLeft}>
          <Text style={styles.subclassName}>{entry.name}</Text>
          {entry.spellcastTrait ? (
            <Text style={styles.subclassTrait}>
              Spellcast: {entry.spellcastTrait.charAt(0).toUpperCase() + entry.spellcastTrait.slice(1)}
            </Text>
          ) : null}
        </View>
        <Text style={styles.chevron}>{expanded ? "▾" : "▸"}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.subclassBody}>
          {entry.text.summary ? <Text style={styles.subclassSummary}>{entry.text.summary}</Text> : null}

          {entry.features.foundation.length > 0 ? (
            <View style={styles.tierBlock}>
              <Text style={styles.tierLabel}>Foundation</Text>
              {entry.features.foundation.map((f) => (
                <Feature key={f.name} title={f.name} text={f.text} />
              ))}
            </View>
          ) : null}

          {entry.features.specialization.length > 0 ? (
            <View style={styles.tierBlock}>
              <Text style={styles.tierLabel}>Specialization</Text>
              {entry.features.specialization.map((f) => (
                <Feature key={f.name} title={f.name} text={f.text} />
              ))}
            </View>
          ) : null}

          {entry.features.mastery.length > 0 ? (
            <View style={styles.tierBlock}>
              <Text style={styles.tierLabel}>Mastery</Text>
              {entry.features.mastery.map((f) => (
                <Feature key={f.name} title={f.name} text={f.text} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function ClassDetails({ entry }: { entry: Extract<SrdEntry, { kind: "class" }> }) {
  const subclasses = entry.subclassIds
    .map((id) => getSrdEntryById(id))
    .filter((e): e is SubclassEntry => e !== null && e.kind === "subclass");

  return (
    <>
      <Section title="Class Details">
        <LinkedKeyValueList label="Domains" field="domain" values={entry.domains} />
        <KeyValue label="Starting Evasion" value={String(entry.startingEvasion)} />
        <KeyValue label="Starting Hit Points" value={String(entry.startingHitPoints)} />
        <KeyValue label="Class Items" value={entry.classItems.join(" or ")} />
        <Feature title={entry.hopeFeature.name} text={entry.hopeFeature.text} />
        {entry.classFeatures.map((feature) => (
          <Feature key={feature.name} title={feature.name} text={feature.text} />
        ))}
      </Section>

      {subclasses.length > 0 ? (
        <Section title="Subclasses">
          {subclasses.map((sub) => (
            <SubclassCard key={sub.id} entry={sub} />
          ))}
        </Section>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  subclassCard: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.button,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  subclassHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  subclassHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  subclassName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  subclassTrait: {
    color: colors.textTertiary,
    fontSize: 13,
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: 18,
    marginLeft: 8,
  },
  subclassBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    padding: 14,
    gap: 16,
  },
  subclassSummary: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  tierBlock: {
    gap: 8,
  },
  tierLabel: {
    color: colors.accentBold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
