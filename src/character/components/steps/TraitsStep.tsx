import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme";
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

  const assign = (trait: TraitName, value: number) =>
    update((c) => {
      c.definition.traits[trait] = c.definition.traits[trait] === value ? null : value;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Assign +2, +1, +1, +0, +0, −1 across your six traits.</Text>
      {TRAIT_NAMES.map((trait) => {
        const current = traits[trait];
        return (
          <View key={trait} style={styles.row}>
            <Text style={styles.traitName}>{TRAIT_LABELS[trait]}</Text>
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
  row: { gap: 8 },
  traitName: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  values: { flexDirection: "row", gap: 8 },
});
