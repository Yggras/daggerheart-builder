import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BuilderTopNav } from "../../../../src/character/components/BuilderTopNav";
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
        <BuilderTopNav characterId={id} />

        <View style={styles.header}>
          <Text style={styles.title}>Build your character</Text>
          <Text style={styles.subtitle}>Drafts autosave. You can leave the builder and come back any time.</Text>
        </View>

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
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.description]}
            value={definition.identity.description}
            placeholder="Appearance, demeanor, or notes"
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
            onChangeText={(text) => update((c) => void (c.definition.identity.description = text))}
          />
        </View>

        <StepHub
          definition={definition}
          onSelect={(slug) => router.push({ pathname: "/characters/[id]/build/[step]", params: { id, step: slug } })}
        />

        <Pressable
          style={[styles.reviewButton, ready ? styles.reviewReady : styles.reviewPending]}
          onPress={() => router.push({ pathname: "/characters/[id]/build/review", params: { id } })}
        >
          <Text style={ready ? styles.reviewTextReady : styles.reviewTextPending}>
            {ready ? "Review & Finish" : "Review Incomplete Draft"}
          </Text>
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
  header: { gap: 4 },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 21 },
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
  description: { minHeight: 88 },
  reviewButton: { alignItems: "center", borderRadius: radii.button, paddingVertical: 15 },
  reviewReady: { backgroundColor: colors.textPrimary },
  reviewPending: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardBackground },
  reviewTextReady: { color: colors.background, fontSize: 16, fontWeight: "800" },
  reviewTextPending: { color: colors.textSecondary, fontSize: 16, fontWeight: "800" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  centeredText: { color: colors.textSecondary, fontSize: 16 },
});
