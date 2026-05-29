import * as Crypto from "expo-crypto";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii } from "../../../theme";
import { CLANK_EXPERIENCE_CHOICE_KEY } from "../../effects";
import { experienceSuggestions } from "../../experienceSuggestions";
import { Chip } from "../Chip";
import type { StepProps } from "./types";

const CLANK_PRIMARY = "ancestry.clank";

export function ExperiencesStep({ character, update }: StepProps) {
  const def = character.definition;
  const experiences = def.experiences;
  const [focused, setFocused] = useState(0);

  // Ensure exactly two Experience slots exist.
  useEffect(() => {
    if (experiences.length < 2) {
      update((c) => {
        while (c.definition.experiences.length < 2) {
          c.definition.experiences.push({ id: Crypto.randomUUID(), text: "", modifier: 2 });
        }
      });
    }
  }, [experiences.length, update]);

  const setText = (index: number, text: string) =>
    update((c) => {
      if (c.definition.experiences[index]) c.definition.experiences[index]!.text = text;
    });

  // Clank "Purposeful Design" (top feature) is active when Clank is the primary ancestry.
  const clankActive = def.heritage.ancestry.primaryId === CLANK_PRIMARY;
  const clankTarget = def.featureChoices[CLANK_EXPERIENCE_CHOICE_KEY];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.hint}>Create two Experiences, each +2. Tap a suggestion to fill the focused field.</Text>

      {[0, 1].map((index) => (
        <View key={index} style={styles.field}>
          <Text style={styles.label}>Experience {index + 1} (+2)</Text>
          <TextInput
            style={[styles.input, focused === index && styles.inputFocused]}
            value={experiences[index]?.text ?? ""}
            placeholder="e.g. Bounty Hunter"
            placeholderTextColor={colors.placeholder}
            onFocus={() => setFocused(index)}
            onChangeText={(text) => setText(index, text)}
          />
        </View>
      ))}

      {clankActive && experiences.length === 2 ? (
        <View style={styles.clank}>
          <Text style={styles.label}>Clank · Purposeful Design</Text>
          <Text style={styles.hint}>Choose one Experience to gain a permanent +1.</Text>
          <View style={styles.chipRow}>
            {experiences.map((experience, index) => (
              <Chip
                key={experience.id}
                label={experience.text.trim() || `Experience ${index + 1}`}
                selected={clankTarget === experience.id}
                onPress={() => update((c) => void (c.definition.featureChoices[CLANK_EXPERIENCE_CHOICE_KEY] = experience.id))}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.suggestions}>
        <Text style={styles.label}>Suggestions</Text>
        {experienceSuggestions.map((category) => (
          <View key={category.label} style={styles.category}>
            <Text style={styles.categoryLabel}>{category.label}</Text>
            <View style={styles.chipRow}>
              {category.examples.map((example) => (
                <Chip key={example} label={example} onPress={() => setText(focused, example)} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 8 },
  hint: { color: colors.textSecondary, fontSize: 14 },
  field: { gap: 6 },
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
  },
  inputFocused: { borderColor: colors.accent, borderWidth: 2 },
  clank: { gap: 8, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 12 },
  suggestions: { gap: 12, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 12 },
  category: { gap: 6 },
  categoryLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: "700" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
