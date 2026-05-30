import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../../theme";
import { ancestries, communities, type AncestryOption, type CommunityOption } from "../../srdOptions";
import { Chip } from "../Chip";
import type { StepProps } from "./types";

export function HeritageStep({ character, update }: StepProps) {
  const def = character.definition;
  const { mode, primaryId, secondaryId } = def.heritage.ancestry;
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleDetails = (id: string) => setExpandedIds((current) => ({ ...current, [id]: !current[id] }));

  const setMode = (next: "single" | "mixed") =>
    update((c) => {
      c.definition.heritage.ancestry.mode = next;
      if (next === "single") c.definition.heritage.ancestry.secondaryId = null;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ancestry</Text>
      <View style={styles.chipRow}>
        <Chip label="Single" selected={mode === "single"} onPress={() => setMode("single")} />
        <Chip label="Mixed" selected={mode === "mixed"} onPress={() => setMode("mixed")} />
      </View>
      <Text style={styles.hint}>
        {mode === "mixed"
          ? "Mixed Ancestry: take the top feature of the primary ancestry and the bottom feature of the secondary."
          : "Take both features of your chosen ancestry."}
      </Text>

      <Text style={styles.label}>{mode === "mixed" ? "Primary ancestry (top feature)" : "Ancestry"}</Text>
      <View style={styles.list}>
        {ancestries.map((ancestry) => (
          <AncestryCard
            key={ancestry.id}
            ancestry={ancestry}
            featureMode={mode === "mixed" ? "top" : "both"}
            expanded={Boolean(expandedIds[`primary:${ancestry.id}`])}
            selected={primaryId === ancestry.id}
            onPress={() => update((c) => void (c.definition.heritage.ancestry.primaryId = ancestry.id))}
            onToggleDetails={() => toggleDetails(`primary:${ancestry.id}`)}
          />
        ))}
      </View>

      {mode === "mixed" ? (
        <View style={styles.block}>
          <Text style={styles.label}>Secondary ancestry (bottom feature)</Text>
          <View style={styles.list}>
            {ancestries
              .filter((ancestry) => ancestry.id !== primaryId)
              .map((ancestry) => (
                <AncestryCard
                  key={ancestry.id}
                  ancestry={ancestry}
                  featureMode="bottom"
                  expanded={Boolean(expandedIds[`secondary:${ancestry.id}`])}
                  selected={secondaryId === ancestry.id}
                  onPress={() => update((c) => void (c.definition.heritage.ancestry.secondaryId = ancestry.id))}
                  onToggleDetails={() => toggleDetails(`secondary:${ancestry.id}`)}
                />
              ))}
          </View>
        </View>
      ) : null}

      <ResolvedFeatures definition={def} />

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>Community</Text>
        <View style={styles.list}>
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              expanded={Boolean(expandedIds[community.id])}
              selected={def.heritage.communityId === community.id}
              onPress={() => update((c) => void (c.definition.heritage.communityId = community.id))}
              onToggleDetails={() => toggleDetails(community.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function AncestryCard({
  ancestry,
  featureMode,
  expanded,
  selected,
  onPress,
  onToggleDetails,
}: {
  ancestry: AncestryOption;
  featureMode: "both" | "top" | "bottom";
  expanded: boolean;
  selected: boolean;
  onPress: () => void;
  onToggleDetails: () => void;
}) {
  const relevantFeatures =
    featureMode === "top" ? ancestry.features.slice(0, 1) : featureMode === "bottom" ? ancestry.features.slice(1, 2) : ancestry.features;
  const label = featureMode === "top" ? "Top feature" : featureMode === "bottom" ? "Bottom feature" : "Features";

  return (
    <View style={[styles.choiceCard, selected && styles.choiceCardSelected]}>
      <View style={styles.choiceHeader}>
        <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{ancestry.name}</Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.choiceBody}>{firstSentence(ancestry.text.original)}</Text>
      <View style={styles.metaRow}>
        <MetaPill label={`${label}: ${relevantFeatures.map((feature) => feature.name).join(" · ")}`} />
      </View>
      <View style={styles.actionRow}>
        <Pressable style={[styles.selectButton, selected && styles.selectButtonSelected]} onPress={onPress}>
          <Text style={styles.selectButtonText}>{selected ? "Selected" : "Choose"}</Text>
        </Pressable>
        <Pressable style={styles.detailsButton} onPress={onToggleDetails}>
          <Text style={styles.detailsButtonText}>{expanded ? "Hide Details" : "Show Details"}</Text>
        </Pressable>
      </View>
      {expanded ? (
        <View style={styles.expandedDetails}>
          <Text style={styles.choiceBody}>{ancestry.text.original}</Text>
          {relevantFeatures.map((feature) => (
            <FeaturePreview key={feature.name} title={label} name={feature.name} text={feature.text} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function CommunityCard({
  community,
  expanded,
  selected,
  onPress,
  onToggleDetails,
}: {
  community: CommunityOption;
  expanded: boolean;
  selected: boolean;
  onPress: () => void;
  onToggleDetails: () => void;
}) {
  return (
    <View style={[styles.choiceCard, selected && styles.choiceCardSelected]}>
      <View style={styles.choiceHeader}>
        <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{community.name}</Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.choiceBody}>{firstSentence(community.text.original)}</Text>
      <View style={styles.metaRow}>
        <MetaPill label={community.feature.name} />
        <MetaPill label={community.adjectives.slice(0, 3).join(" · ")} />
      </View>
      <View style={styles.actionRow}>
        <Pressable style={[styles.selectButton, selected && styles.selectButtonSelected]} onPress={onPress}>
          <Text style={styles.selectButtonText}>{selected ? "Selected" : "Choose"}</Text>
        </Pressable>
        <Pressable style={styles.detailsButton} onPress={onToggleDetails}>
          <Text style={styles.detailsButtonText}>{expanded ? "Hide Details" : "Show Details"}</Text>
        </Pressable>
      </View>
      {expanded ? (
        <View style={styles.expandedDetails}>
          <Text style={styles.choiceBody}>{community.text.original}</Text>
          <FeaturePreview title="Community Feature" name={community.feature.name} text={community.feature.text} />
          <View style={styles.metaRow}>
            {community.adjectives.map((adjective) => (
              <MetaPill key={adjective} label={adjective} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  );
}

function FeaturePreview({ title, name, text }: { title: string; name: string; text: string }) {
  return (
    <View style={styles.featurePreview}>
      <Text style={styles.featureKicker}>{title}</Text>
      <Text style={styles.featureName}>{name}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function ResolvedFeatures({ definition }: { definition: StepProps["character"]["definition"] }) {
  const { mode, primaryId, secondaryId } = definition.heritage.ancestry;
  const primary = ancestries.find((a) => a.id === primaryId);
  const secondary = ancestries.find((a) => a.id === secondaryId);
  if (!primary) return null;

  const features =
    mode === "single"
      ? primary.features.map((f) => `${primary.name}: ${f.name}`)
      : [
          primary.features[0] ? `${primary.name}: ${primary.features[0].name}` : null,
          secondary?.features[1] ? `${secondary.name}: ${secondary.features[1].name}` : null,
        ].filter((value): value is string => Boolean(value));

  if (features.length === 0) return null;
  return (
    <View style={styles.resolved}>
      <Text style={styles.label}>Ancestry features</Text>
      {features.map((feature) => (
        <Text key={feature} style={styles.feature}>
          • {feature}
        </Text>
      ))}
    </View>
  );
}

function firstSentence(text: string): string {
  const match = /^.*?[.!?](?:\s|$)/.exec(text);
  return match?.[0].trim() ?? text;
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  block: { gap: 10, marginTop: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.textSecondary, fontSize: 13 },
  label: { color: colors.textTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  list: { gap: 10 },
  chipRow: { flexDirection: "row", gap: 8 },
  choiceCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    padding: 16,
  },
  choiceCardSelected: { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.highlightBackground },
  choiceHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  choiceTitle: { flex: 1, color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  choiceTitleSelected: { color: colors.accentBold },
  choiceBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  check: { color: colors.accentBold, fontSize: 20, fontWeight: "800" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaPill: { borderRadius: radii.chip, backgroundColor: colors.borderSubtle, paddingHorizontal: 10, paddingVertical: 5 },
  metaPillText: { color: colors.textPrimary, fontSize: 12, fontWeight: "800" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectButton: {
    alignItems: "center",
    borderRadius: radii.button,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectButtonSelected: { backgroundColor: colors.accent },
  selectButtonText: { color: colors.background, fontSize: 14, fontWeight: "800" },
  detailsButton: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.button,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  detailsButtonText: { color: colors.link, fontSize: 14, fontWeight: "800" },
  expandedDetails: { gap: 10, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 10 },
  featurePreview: { gap: 3, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 9 },
  featureKicker: { color: colors.accentBold, fontSize: 11, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  featureName: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
  featureText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  resolved: { gap: 4, marginTop: 4 },
  feature: { color: colors.textSecondary, fontSize: 14 },
});
