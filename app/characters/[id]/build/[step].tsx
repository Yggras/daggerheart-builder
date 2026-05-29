import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatSummaryBar } from "../../../../src/character/components/StatSummaryBar";
import { StepFooter } from "../../../../src/character/components/StepFooter";
import { StepBody } from "../../../../src/character/components/steps";
import { useCharacterDraft } from "../../../../src/character/useCharacterDraft";
import { adjacentStep, getStep, type StepSlug } from "../../../../src/character/steps";
import { colors } from "../../../../src/theme";

export default function BuildStepScreen() {
  const { id, step } = useLocalSearchParams<{ id: string; step: string }>();
  const router = useRouter();
  const { character, loading, update } = useCharacterDraft(id);
  const stepDef = getStep(step);

  if (loading) return <Centered text="Loading…" />;
  if (!character || !stepDef) return <Centered text="Step not found." />;

  const next = adjacentStep(stepDef.slug as StepSlug, 1);
  const goNext = () =>
    next
      ? router.push({ pathname: "/characters/[id]/build/[step]", params: { id, step: next.slug } })
      : router.push({ pathname: "/characters/[id]/build/review", params: { id } });

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: stepDef.title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{stepDef.title}</Text>
        <Text style={styles.blurb}>{stepDef.blurb}</Text>

        <View style={styles.body}>
          <StepBody slug={stepDef.slug as StepSlug} character={character} update={update} />
        </View>
      </ScrollView>

      <StatSummaryBar definition={character.definition} />
      <View style={styles.footerWrap}>
        <StepFooter onBack={() => router.back()} onNext={goNext} nextLabel={next ? "Next" : "Review"} />
      </View>
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
  content: { padding: 16, gap: 8, paddingBottom: 24 },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: "800" },
  blurb: { color: colors.textSecondary, fontSize: 15 },
  body: { marginTop: 12 },
  footerWrap: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  centeredText: { color: colors.textSecondary, fontSize: 16 },
});
