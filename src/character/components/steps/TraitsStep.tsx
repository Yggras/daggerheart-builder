import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../../theme";
import { TRAIT_NAMES, type TraitName } from "../../schema";
import { Chip } from "../Chip";
import type { StepProps } from "./types";

// Distinct trait-array values and how many of each may be assigned: +2×1, +1×2, 0×2, −1×1.
const VALUES = [2, 1, 0, -1] as const;
const QUOTA: Record<number, number> = { 2: 1, 1: 2, 0: 2, [-1]: 1 };

const TRAIT_LABELS: Record<TraitName, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

function label(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

export function TraitsStep({ character, update }: StepProps) {
  const traits = character.definition.traits;

  const counts = new Map<number, number>();
  for (const trait of TRAIT_NAMES) {
    const value = traits[trait];
    if (value !== null) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const assigned = TRAIT_NAMES.filter((trait) => traits[trait] !== null).length;

  const assign = (trait: TraitName, value: number) =>
    update((c) => {
      c.definition.traits[trait] = c.definition.traits[trait] === value ? null : value;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Assign +2, +1, +1, +0, +0, −1 across your six traits.</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{assigned}/6 traits assigned</Text>
        <View style={styles.poolRow}>
          {VALUES.map((value) => {
            const used = counts.get(value) ?? 0;
            const remaining = Math.max((QUOTA[value] ?? 0) - used, 0);
            return <Text key={value} style={[styles.poolItem, remaining === 0 && styles.poolItemDone]}>{label(value)} x{remaining}</Text>;
          })}
        </View>
      </View>
      {TRAIT_NAMES.map((trait) => {
        const current = traits[trait];
        return (
          <View key={trait} style={styles.row}>
            <Text style={styles.traitName}>{TRAIT_LABELS[trait]}</Text>
            <Text style={styles.currentValue}>{current === null ? "Unassigned" : label(current)}</Text>
            <View style={styles.values}>
              {VALUES.map((value) => {
                const used = counts.get(value) ?? 0;
                const exhausted = used >= (QUOTA[value] ?? 0) && current !== value;
                return (
                  <Chip
                    key={value}
                    label={label(value)}
                    selected={current === value}
                    disabled={exhausted}
                    onPress={() => assign(trait, value)}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  hint: { color: colors.textSecondary, fontSize: 14 },
  summaryCard: { gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, backgroundColor: colors.cardBackground, padding: 14 },
  summaryTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "800" },
  poolRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  poolItem: { overflow: "hidden", borderRadius: radii.chip, backgroundColor: colors.highlightBackground, color: colors.textPrimary, fontSize: 13, fontWeight: "800", paddingHorizontal: 10, paddingVertical: 5 },
  poolItemDone: { backgroundColor: colors.borderSubtle, color: colors.textTertiary },
  row: { gap: 8, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 10 },
  traitName: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  currentValue: { color: colors.textTertiary, fontSize: 13, fontWeight: "700" },
  values: { flexDirection: "row", gap: 8 },
});
