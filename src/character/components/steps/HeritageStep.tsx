import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme";
import { ancestries, communities, type AncestryOption } from "../../srdOptions";
import { Chip } from "../Chip";
import { OptionCard } from "../OptionCard";
import type { StepProps } from "./types";

export function HeritageStep({ character, update }: StepProps) {
  const def = character.definition;
  const { mode, primaryId, secondaryId } = def.heritage.ancestry;

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
          <OptionCard
            key={ancestry.id}
            title={ancestry.name}
            subtitle={featureSummary(ancestry)}
            selected={primaryId === ancestry.id}
            onPress={() => update((c) => void (c.definition.heritage.ancestry.primaryId = ancestry.id))}
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
                <OptionCard
                  key={ancestry.id}
                  title={ancestry.name}
                  subtitle={featureSummary(ancestry)}
                  selected={secondaryId === ancestry.id}
                  onPress={() => update((c) => void (c.definition.heritage.ancestry.secondaryId = ancestry.id))}
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
            <OptionCard
              key={community.id}
              title={community.name}
              subtitle={community.feature.name}
              selected={def.heritage.communityId === community.id}
              onPress={() => update((c) => void (c.definition.heritage.communityId = community.id))}
            />
          ))}
        </View>
      </View>
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

function featureSummary(ancestry: AncestryOption): string {
  return ancestry.features.map((f) => f.name).join(" · ");
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  block: { gap: 10, marginTop: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.textSecondary, fontSize: 13 },
  label: { color: colors.textTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  list: { gap: 10 },
  chipRow: { flexDirection: "row", gap: 8 },
  resolved: { gap: 4, marginTop: 4 },
  feature: { color: colors.textSecondary, fontSize: 14 },
});
