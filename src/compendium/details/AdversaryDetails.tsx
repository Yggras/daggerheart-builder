import { StyleSheet, Text, View } from "react-native";
import type { SrdEntry } from "../../srd/schema";
import { colors, radii } from "../../theme";
import { Feature, Section, formatThresholds } from "../components/Section";

function formatEnum(s: string) {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function AdversaryDetails({ entry }: { entry: Extract<SrdEntry, { kind: "adversary" }> }) {
  const modifier =
    typeof entry.attack.modifier === "number"
      ? `${entry.attack.modifier >= 0 ? "+" : ""}${entry.attack.modifier}`
      : entry.attack.modifier;

  const thresholds = formatThresholds(entry.thresholds);

  return (
    <Section title="Adversary Details">
      <View style={styles.statRow}>
        <Stat label="Tier" value={String(entry.tier)} />
        <Stat label="Role" value={formatEnum(entry.role)} />
        <Stat label="Difficulty" value={String(entry.difficulty)} />
      </View>

      <View style={styles.statRow}>
        <Stat label="HP" value={String(entry.hitPoints)} />
        <Stat label="Stress" value={String(entry.stress)} />
        <Stat label="Thresholds" value={thresholds} />
      </View>

      <View style={styles.attackCard}>
        <View style={styles.attackHeader}>
          <Text style={styles.attackName}>{entry.attack.name}</Text>
          <Text style={styles.attackMod}>{modifier}</Text>
        </View>
        <Text style={styles.attackDetail}>
          {formatEnum(entry.attack.range)} · {entry.attack.damage.roll} {formatEnum(entry.attack.damage.type)}
        </Text>
      </View>

      {entry.motivesAndTactics.length > 0 ? (
        <View style={styles.pillSection}>
          <Text style={styles.sectionLabel}>Motives & Tactics</Text>
          <View style={styles.pillRow}>
            {entry.motivesAndTactics.map((motive) => (
              <View key={motive} style={styles.pill}>
                <Text style={styles.pillText}>{motive}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {entry.experiences.length > 0 ? (
        <View style={styles.experienceSection}>
          <Text style={styles.sectionLabel}>Experiences</Text>
          {entry.experiences.map((exp) => (
            <View key={exp.name} style={styles.experienceRow}>
              <Text style={styles.experienceName}>{exp.name}</Text>
              <Text style={styles.experienceModifier}>+{exp.modifier}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {entry.features.map((feature) => (
        <Feature key={feature.name} title={feature.name} text={feature.text} />
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: "row",
    gap: 1,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 2,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.accentBold,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  attackCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  attackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attackName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  attackMod: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "800",
  },
  attackDetail: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  sectionLabel: {
    color: colors.accentBold,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pillSection: {
    gap: 6,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.chip,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  experienceSection: {
    gap: 4,
  },
  experienceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  experienceName: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  experienceModifier: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
});
