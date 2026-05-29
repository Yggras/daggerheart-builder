import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii } from "../../theme";

// Small selectable pill used for compact choices (trait values, ranges, numbers, suggestions).
export function Chip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, selected && styles.selected, disabled && styles.disabled]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.chip,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  disabled: { opacity: 0.35 },
  text: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
  textSelected: { color: colors.background },
});
