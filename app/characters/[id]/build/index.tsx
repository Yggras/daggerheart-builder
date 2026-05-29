import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StatSummaryBar } from "../../../../src/character/components/StatSummaryBar";
import { StepHub } from "../../../../src/character/components/StepHub";
import { useCharacterDraft } from "../../../../src/character/useCharacterDraft";
import { isDefinitionComplete } from "../../../../src/character/steps";
import { colors, radii } from "../../../../src/theme";

export default function BuildHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { character, loading, update } = useCharacterDraft(id);

  if (loading) return <Centered text="Loading…" />;
  if (!character) return <Centered text="Character not found." />;

  const definition = character.definition;
  const ready = isDefinitionComplete(definition);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={definition.identity.name}
            placeholder="Character name"
            placeholderTextColor={colors.placeholder}
            onChangeText={(text) => update((c) => void (c.definition.identity.name = text))}
          />
          <Text style={styles.label}>Pronouns</Text>
          <TextInput
            style={styles.input}
            value={definition.identity.pronouns}
            placeholder="e.g. they/them"
            placeholderTextColor={colors.placeholder}
            onChangeText={(text) => update((c) => void (c.definition.identity.pronouns = text))}
          />
        </View>

        <StepHub
          definition={definition}
          onSelect={(slug) => router.push({ pathname: "/characters/[id]/build/[step]", params: { id, step: slug } })}
        />

        <Text
          style={[styles.review, ready ? styles.reviewReady : styles.reviewPending]}
          onPress={() => router.push({ pathname: "/characters/[id]/build/review", params: { id } })}
        >
          {ready ? "Review & Finish →" : "Review (incomplete) →"}
        </Text>
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
  identity: { gap: 6 },
  label: { color: colors.textTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  review: { textAlign: "center", fontSize: 16, fontWeight: "800", paddingVertical: 14 },
  reviewReady: { color: colors.accentBold },
  reviewPending: { color: colors.textTertiary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  centeredText: { color: colors.textSecondary, fontSize: 16 },
});
