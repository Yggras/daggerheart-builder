import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatSummaryBar } from "../../../../src/character/components/StatSummaryBar";
import { useCharacterDraft } from "../../../../src/character/useCharacterDraft";
import { updateCharacter } from "../../../../src/character/store";
import { WIZARD_STEPS, isDefinitionComplete } from "../../../../src/character/steps";
import { colors, radii } from "../../../../src/theme";

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { character, loading } = useCharacterDraft(id);

  if (loading) return <Centered text="Loading…" />;
  if (!character) return <Centered text="Character not found." />;

  const definition = character.definition;
  const ready = isDefinitionComplete(definition);

  const onComplete = async () => {
    await updateCharacter(id, (c) => void (c.meta.status = "complete"));
    router.dismissAll();
    router.replace({ pathname: "/characters/[id]", params: { id } });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review</Text>
        <Text style={styles.subtitle}>{definition.identity.name.trim() || "Unnamed character"}</Text>

        <View style={styles.checklist}>
          {WIZARD_STEPS.map((step) => {
            const done = step.isComplete(definition);
            return (
              <View key={step.slug} style={styles.checkRow}>
                <Text style={[styles.checkIcon, done ? styles.checkDone : styles.checkPending]}>{done ? "✓" : "○"}</Text>
                <Text style={styles.checkLabel}>{step.title}</Text>
                {step.optional ? <Text style={styles.optional}>optional</Text> : null}
              </View>
            );
          })}
        </View>

        <Pressable
          style={[styles.complete, !ready && styles.completeDisabled]}
          disabled={!ready}
          onPress={onComplete}
        >
          <Text style={styles.completeText}>{ready ? "Complete Character" : "Finish the required steps first"}</Text>
        </Pressable>
      </ScrollView>

      <StatSummaryBar definition={definition} />
    </View>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.centeredText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 17 },
  checklist: { gap: 10 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkIcon: { fontSize: 18, fontWeight: "800", width: 22 },
  checkDone: { color: colors.accentBold },
  checkPending: { color: colors.textTertiary },
  checkLabel: { color: colors.textPrimary, fontSize: 16, flex: 1 },
  optional: { color: colors.textTertiary, fontSize: 12 },
  complete: {
    marginTop: 8,
    alignItems: "center",
    borderRadius: radii.button,
    backgroundColor: colors.textPrimary,
    paddingVertical: 16,
  },
  completeDisabled: { opacity: 0.4 },
  completeText: { color: colors.background, fontSize: 17, fontWeight: "800" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  centeredText: { color: colors.textSecondary, fontSize: 16 },
});
