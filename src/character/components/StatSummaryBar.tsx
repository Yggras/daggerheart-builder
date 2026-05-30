import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../theme";
import { deriveCharacter } from "../engine";
import type { CharacterDefinition } from "../schema";

// Compact, collapsed-by-default live stats bar (CBW-23). Shows a single line of key derived values;
// tap to expand a full breakdown with effect provenance. Kept to a minimal footprint so it never
// crowds the step content.
export function StatSummaryBar({ definition }: { definition: CharacterDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const stats = deriveCharacter(definition);

  const fmt = (value: number | null) => (value === null ? "—" : String(value));
  const thresholds = `${fmt(stats.thresholds.major)}/${fmt(stats.thresholds.severe)}`;

  return (
    <Pressable style={styles.bar} onPress={() => setExpanded((value) => !value)}>
      <View style={styles.line}>
        <Stat label="Evasion" value={fmt(stats.evasion)} />
        <Stat label="HP" value={fmt(stats.hpMax)} />
        <Stat label="Threshold" value={thresholds} />
        <Stat label="Hope" value={String(stats.hope)} />
        <Stat label="Stress" value={String(stats.stressSlots)} />
        <Stat label="Prof" value={String(stats.proficiency)} />
        <Text style={styles.caret}>{expanded ? "Hide" : "Details"}</Text>
      </View>

      {expanded ? (
        <View style={styles.details}>
          <Detail label="Armor Score" value={fmt(stats.armorScore)} />
          <Detail
            label="Spellcast"
            value={stats.spellcast ? `${capitalize(stats.spellcast.trait)} ${fmtMod(stats.spellcast.modifier)}` : "—"}
          />
          {stats.attacks.map((attack) => (
            <Detail
              key={attack.slot}
              label={`${capitalize(attack.slot)} attack`}
              value={`${attack.damageRoll ?? "—"} (${capitalize(String(attack.attackTrait))} ${fmtMod(attack.attackModifier)})`}
            />
          ))}
          {stats.appliedEffects.length > 0 ? (
            <Text style={styles.effects}>
              {stats.appliedEffects.map((effect) => `+${effect.value} ${effect.label}`).join(" · ")}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function capitalize(value: string): string {
  return value.length > 0 ? `${value[0]!.toUpperCase()}${value.slice(1)}` : value;
}

function fmtMod(value: number | null): string {
  if (value === null) return "";
  return value >= 0 ? `+${value}` : String(value);
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  line: { flexDirection: "row", alignItems: "center", gap: 10 },
  stat: { alignItems: "center", minWidth: 38 },
  statValue: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
  statLabel: { color: colors.textTertiary, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 },
  caret: { marginLeft: "auto", color: colors.link, fontSize: 12, fontWeight: "800" },
  details: { marginTop: 10, gap: 4, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { color: colors.textSecondary, fontSize: 13 },
  detailValue: { color: colors.textPrimary, fontSize: 13, fontWeight: "700" },
  effects: { color: colors.accent, fontSize: 12, marginTop: 4 },
});
