import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../theme";

// Selectable card used throughout the wizard for picking a single option (class, ancestry, weapon…).
export function OptionCard({
  title,
  subtitle,
  selected,
  disabled,
  onPress,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, selected && styles.cardSelected, disabled && styles.cardDisabled]}
    >
      <View style={styles.body}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {selected ? <Text style={styles.check}>✓</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardSelected: { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.highlightBackground },
  cardDisabled: { opacity: 0.45 },
  body: { flex: 1, gap: 3 },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
  titleSelected: { color: colors.accentBold },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  check: { color: colors.accentBold, fontSize: 20, fontWeight: "800" },
});
