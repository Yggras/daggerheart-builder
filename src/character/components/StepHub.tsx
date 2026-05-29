import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../theme";
import type { CharacterDefinition } from "../schema";
import { WIZARD_STEPS } from "../steps";

// Step overview / launcher: shows each step's status and lets the user jump to any unlocked step.
export function StepHub({
  definition,
  onSelect,
}: {
  definition: CharacterDefinition;
  onSelect: (slug: string) => void;
}) {
  return (
    <View style={styles.list}>
      {WIZARD_STEPS.map((step, index) => {
        const locked = step.isLocked(definition);
        const complete = step.isComplete(definition);
        return (
          <Pressable
            key={step.slug}
            style={[styles.row, locked && styles.rowLocked]}
            disabled={locked}
            onPress={() => onSelect(step.slug)}
          >
            <View style={[styles.marker, complete && !locked && styles.markerComplete]}>
              <Text style={styles.markerText}>{locked ? "🔒" : complete ? "✓" : index + 1}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.blurb}>{locked ? "Choose a class first" : step.blurb}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLocked: { opacity: 0.5 },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.highlightBackground,
  },
  markerComplete: { backgroundColor: colors.accent },
  markerText: { color: colors.textPrimary, fontSize: 14, fontWeight: "800" },
  body: { flex: 1, gap: 2 },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  blurb: { color: colors.textSecondary, fontSize: 13 },
  chevron: { color: colors.textTertiary, fontSize: 22 },
});
