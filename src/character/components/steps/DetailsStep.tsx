import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../../theme";
import { deriveCharacter } from "../../engine";
import type { StepProps } from "./types";

// Step 4 is automatic: level, Evasion, HP, Stress, and Hope are all derived. Shown read-only.
export function DetailsStep({ character }: StepProps) {
  const stats = deriveCharacter(character.definition);
  const fmt = (value: number | null) => (value === null ? "—" : String(value));

  const rows: Array<[string, string, string?]> = [
    ["Level", String(character.definition.level)],
    ["Evasion", fmt(stats.evasion), stats.evasion === null ? "Choose a class" : "From your class"],
    ["Hit Points", fmt(stats.hpMax), stats.hpMax === null ? "Choose a class" : "From your class"],
    ["Stress", String(stats.stressSlots), "Every PC starts with 6"],
    ["Hope", String(stats.hope), "Every PC starts with 2"],
    ["Proficiency", String(stats.proficiency), "Level 1"],
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>These values are calculated automatically from your choices.</Text>
      {rows.map(([label, value, note]) => (
        <View key={label} style={styles.row}>
          <View style={styles.rowMain}>
            <Text style={styles.label}>{label}</Text>
            {note ? <Text style={styles.note}>{note}</Text> : null}
          </View>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  hint: { color: colors.textSecondary, fontSize: 14, marginBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowMain: { flex: 1, gap: 2 },
  label: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  note: { color: colors.textTertiary, fontSize: 12 },
  value: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
});
