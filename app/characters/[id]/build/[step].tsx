import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BuilderTopNav } from "../../../../src/character/components/BuilderTopNav";
import { StatSummaryBar } from "../../../../src/character/components/StatSummaryBar";
import { StepFooter } from "../../../../src/character/components/StepFooter";
import { StepBody } from "../../../../src/character/components/steps";
import { useCharacterDraft } from "../../../../src/character/useCharacterDraft";
import { WIZARD_STEPS, adjacentUnlockedStep, getStep, getStepMissingReason, stepIndex, type StepSlug } from "../../../../src/character/steps";
import { colors, radii } from "../../../../src/theme";

export default function BuildStepScreen() {
  const { id, step } = useLocalSearchParams<{ id: string; step: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { character, loading, update } = useCharacterDraft(id);
  const stepDef = getStep(step);

  if (loading) return <Centered text="Loading…" />;
  if (!character || !stepDef) return <Centered text="Step not found." />;

  const slug = stepDef.slug as StepSlug;
  const definition = character.definition;
  const currentIndex = stepIndex(slug);
  const previous = adjacentUnlockedStep(slug, -1, definition);
  const next = adjacentUnlockedStep(slug, 1, definition);
  const locked = stepDef.isLocked(definition);
  const goHub = () => router.push({ pathname: "/characters/[id]/build", params: { id } });
  const goBack = () =>
    previous
      ? router.push({ pathname: "/characters/[id]/build/[step]", params: { id, step: previous.slug } })
      : goHub();
  const goNext = () =>
    next
      ? router.push({ pathname: "/characters/[id]/build/[step]", params: { id, step: next.slug } })
      : router.push({ pathname: "/characters/[id]/build/review", params: { id } });

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Stack.Screen options={{ title: stepDef.title }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}>
        <BuilderTopNav characterId={id} showAllSteps />

        <View style={styles.stepHeader}>
          <Text style={styles.kicker}>Step {currentIndex + 1} of {WIZARD_STEPS.length}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((currentIndex + 1) / WIZARD_STEPS.length) * 100}%` }]} />
          </View>
          <Text style={styles.title}>{stepDef.title}</Text>
          <Text style={styles.blurb}>{locked ? getStepMissingReason(stepDef, definition) : stepDef.blurb}</Text>
        </View>

        {locked ? (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>This step is locked</Text>
            <Text style={styles.lockedText}>{getStepMissingReason(stepDef, definition)}</Text>
          </View>
        ) : (
          <View style={styles.body}>
            <StepBody slug={slug} character={character} update={update} />
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomDock, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <StatSummaryBar definition={definition} />
        <View style={styles.footerWrap}>
          <StepFooter onBack={goBack} onNext={locked ? goHub : goNext} nextLabel={locked ? "All Steps" : next ? "Next" : "Review"} />
        </View>
      </View>
    </KeyboardAvoidingView>
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
  content: { padding: 16, gap: 12 },
  stepHeader: { gap: 8 },
  kicker: { color: colors.accentBold, fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  progressTrack: { height: 5, borderRadius: 999, backgroundColor: colors.borderSubtle, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: colors.accent },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: "800" },
  blurb: { color: colors.textSecondary, fontSize: 15 },
  body: { marginTop: 12 },
  lockedCard: {
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    padding: 16,
  },
  lockedTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: "800" },
  lockedText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  bottomDock: { backgroundColor: colors.background },
  footerWrap: { paddingHorizontal: 16, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  centeredText: { color: colors.textSecondary, fontSize: 16 },
});
