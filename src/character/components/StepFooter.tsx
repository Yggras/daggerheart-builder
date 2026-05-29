import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../theme";

// Back / Next navigation footer for wizard steps. Navigation is always allowed between unlocked
// steps; the Next label becomes "Review" on the last step. `nextDisabled` is used only when a step
// must block forward motion (rare); strict completion is enforced on the Review screen.
export function StepFooter({
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <View style={styles.footer}>
      <Pressable
        style={[styles.button, styles.back, !onBack && styles.hidden]}
        onPress={onBack}
        disabled={!onBack}
      >
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.next, nextDisabled && styles.disabled]}
        onPress={onNext}
        disabled={nextDisabled || !onNext}
      >
        <Text style={styles.nextText}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: "row", gap: 12, paddingTop: 8 },
  button: { flex: 1, alignItems: "center", borderRadius: radii.button, paddingVertical: 15 },
  back: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardBackground },
  next: { backgroundColor: colors.textPrimary },
  disabled: { opacity: 0.4 },
  hidden: { opacity: 0 },
  backText: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  nextText: { color: colors.background, fontSize: 16, fontWeight: "800" },
});
