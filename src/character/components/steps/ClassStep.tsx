import * as Crypto from "expo-crypto";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii } from "../../../theme";
import type { Character, Companion } from "../../schema";
import { WIZARD_STRANGE_PATTERNS_KEY } from "../../steps";
import { classes, subclassesForClass, type ClassOption, type SubclassOption } from "../../srdOptions";
import { Chip } from "../Chip";
import { formatRange, type StepProps } from "./types";

const BEASTBOUND_ID = "subclass.ranger.beastbound";
const WIZARD_ID = "class.wizard";

function makeExperience() {
  return { id: Crypto.randomUUID(), text: "", modifier: 2 };
}

function makeCompanion(): Companion {
  return {
    name: "",
    animalKind: "",
    evasion: 10,
    experiences: [makeExperience(), makeExperience()],
    attack: { description: "", range: "melee", damageDie: "d6", damageType: null },
  };
}

export function ClassStep({ character, update }: StepProps) {
  const def = character.definition;
  const selectedClass = classes.find((cls) => cls.id === def.classId);
  const subclasses = subclassesForClass(def.classId);
  const [showClassPicker, setShowClassPicker] = useState(!def.classId);
  const [expandedClassIds, setExpandedClassIds] = useState<Record<string, boolean>>({});

  const toggleClassDetails = (classId: string) =>
    setExpandedClassIds((current) => ({ ...current, [classId]: !current[classId] }));

  const selectClass = (classId: string) => {
    setShowClassPicker(false);
    update((c) => {
      if (c.definition.classId === classId) return;
      c.definition.classId = classId;
      // Reset choices that depend on class.
      c.definition.subclassId = null;
      c.definition.domainCards = [];
      c.definition.companion = null;
      delete c.definition.featureChoices[WIZARD_STRANGE_PATTERNS_KEY];
    });
  };

  const selectSubclass = (subclassId: string) =>
    update((c) => {
      c.definition.subclassId = subclassId;
      c.definition.companion = subclassId === BEASTBOUND_ID ? c.definition.companion ?? makeCompanion() : null;
    });

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>Class</Text>
          <Text style={styles.hint}>Choose the broad fantasy and core mechanics for this character.</Text>
        </View>
        {selectedClass ? (
          <Pressable style={styles.smallButton} onPress={() => setShowClassPicker((value) => !value)}>
            <Text style={styles.smallButtonText}>{showClassPicker ? "Keep" : "Change"}</Text>
          </Pressable>
        ) : null}
      </View>

      {selectedClass && !showClassPicker ? (
        <SelectedClassSummary cls={selectedClass} />
      ) : (
        <View style={styles.list}>
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              expanded={Boolean(expandedClassIds[cls.id])}
              selected={def.classId === cls.id}
              onPress={() => selectClass(cls.id)}
              onToggleDetails={() => toggleClassDetails(cls.id)}
            />
          ))}
        </View>
      )}

      {selectedClass ? (
        <View style={styles.block}>
          <View style={styles.requiredHeader}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Choose Your Subclass</Text>
              <Text style={styles.hint}>Required. Pick one foundation path for your {selectedClass.name}.</Text>
            </View>
            <Text style={styles.requiredBadge}>{def.subclassId ? "Chosen" : "Required"}</Text>
          </View>

          <View style={styles.list}>
            {subclasses.map((sub) => (
              <SubclassCard key={sub.id} subclass={sub} selected={def.subclassId === sub.id} onPress={() => selectSubclass(sub.id)} />
            ))}
          </View>
        </View>
      ) : null}

      {def.classId === WIZARD_ID ? (
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Strange Patterns</Text>
          <Text style={styles.hint}>Choose a number between 1 and 12.</Text>
          <View style={styles.chipRow}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <Chip
                key={n}
                label={String(n)}
                selected={def.featureChoices[WIZARD_STRANGE_PATTERNS_KEY] === n}
                onPress={() => update((c) => void (c.definition.featureChoices[WIZARD_STRANGE_PATTERNS_KEY] = n))}
              />
            ))}
          </View>
        </View>
      ) : null}

      {def.subclassId === BEASTBOUND_ID && def.companion ? (
        <CompanionForm character={character} update={update} />
      ) : null}
    </View>
  );
}

function ClassCard({
  cls,
  expanded,
  selected,
  onPress,
  onToggleDetails,
}: {
  cls: ClassOption;
  expanded: boolean;
  selected: boolean;
  onPress: () => void;
  onToggleDetails: () => void;
}) {
  return (
    <View style={[styles.choiceCard, selected && styles.choiceCardSelected]}>
      <View style={styles.choiceHeader}>
        <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{cls.name}</Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.choiceBody}>{firstSentence(cls.text.original)}</Text>
      <View style={styles.metaRow}>
        <MetaPill label={cls.domains.join(" & ")} />
        <MetaPill label={`Evasion ${cls.startingEvasion}`} />
        <MetaPill label={`HP ${cls.startingHitPoints}`} />
      </View>
      <View style={styles.actionRow}>
        <Pressable style={[styles.selectButton, selected && styles.selectButtonSelected]} onPress={onPress}>
          <Text style={[styles.selectButtonText, selected && styles.selectButtonTextSelected]}>{selected ? "Selected" : "Choose"}</Text>
        </Pressable>
        <Pressable style={styles.detailsButton} onPress={onToggleDetails}>
          <Text style={styles.detailsButtonText}>{expanded ? "Hide Details" : "Show Details"}</Text>
        </Pressable>
      </View>
      {expanded ? (
        <View style={styles.expandedDetails}>
          <Text style={styles.choiceBody}>{cls.text.original}</Text>
          <FeaturePreview title="Hope" name={cls.hopeFeature.name} text={cls.hopeFeature.text} />
          {cls.classFeatures.map((feature) => (
            <FeaturePreview key={feature.name} title="Feature" name={feature.name} text={feature.text} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SelectedClassSummary({ cls }: { cls: ClassOption }) {
  return (
    <View style={[styles.choiceCard, styles.selectedSummary]}>
      <View style={styles.choiceHeader}>
        <Text style={styles.choiceTitle}>{cls.name}</Text>
        <Text style={styles.requiredBadge}>Class</Text>
      </View>
      <View style={styles.metaRow}>
        <MetaPill label={cls.domains.join(" & ")} />
        <MetaPill label={`Evasion ${cls.startingEvasion}`} />
        <MetaPill label={`HP ${cls.startingHitPoints}`} />
        <MetaPill label={`Hope: ${cls.hopeFeature.name}`} />
      </View>
    </View>
  );
}

function SubclassCard({
  subclass,
  selected,
  onPress,
}: {
  subclass: SubclassOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.choiceCard, styles.subclassCard, selected && styles.choiceCardSelected]} onPress={onPress}>
      <View style={styles.choiceHeader}>
        <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{subclass.name}</Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.choiceBody}>{subclass.text.original}</Text>
      <View style={styles.metaRow}>
        <MetaPill label={subclass.spellcastTrait ? `Spellcast: ${capitalize(subclass.spellcastTrait)}` : "No Spellcast"} />
        <MetaPill label="Foundation" />
      </View>
      {subclass.features.foundation.map((feature) => (
        <FeaturePreview key={feature.name} title="Foundation" name={feature.name} text={feature.text} />
      ))}
    </Pressable>
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

function CompanionForm({ character, update }: StepProps) {
  const companion = character.definition.companion;
  if (!companion) return null;

  const setCompanion = (mutate: (companion: Companion) => void) =>
    update((c) => {
      if (c.definition.companion) mutate(c.definition.companion);
    });

  return (
    <View style={styles.block}>
      <Text style={styles.sectionTitle}>Companion</Text>
      <Field label="Name">
        <TextInput
          style={styles.input}
          value={companion.name}
          placeholder="Companion name"
          placeholderTextColor={colors.placeholder}
          onChangeText={(text) => setCompanion((comp) => void (comp.name = text))}
        />
      </Field>
      <Field label="Animal kind">
        <TextInput
          style={styles.input}
          value={companion.animalKind}
          placeholder="e.g. Hawk, Wolf"
          placeholderTextColor={colors.placeholder}
          onChangeText={(text) => setCompanion((comp) => void (comp.animalKind = text))}
        />
      </Field>
      <Text style={styles.hint}>Evasion starts at 10. Damage die is d6 at level 1.</Text>

      {companion.experiences.map((experience, index) => (
        <Field key={experience.id} label={`Companion Experience ${index + 1} (+2)`}>
          <TextInput
            style={styles.input}
            value={experience.text}
            placeholder="e.g. Loyal, Scout"
            placeholderTextColor={colors.placeholder}
            onChangeText={(text) => setCompanion((comp) => void (comp.experiences[index]!.text = text))}
          />
        </Field>
      ))}

      <Field label="Attack description">
        <TextInput
          style={styles.input}
          value={companion.attack.description}
          placeholder="e.g. Talons"
          placeholderTextColor={colors.placeholder}
          onChangeText={(text) => setCompanion((comp) => void (comp.attack.description = text))}
        />
      </Field>
      <Text style={styles.label}>Attack range</Text>
      <View style={styles.chipRow}>
        {(["melee", "very_close", "close", "far", "very_far"] as const).map((range) => (
          <Chip
            key={range}
            label={formatRange(range)}
            selected={companion.attack.range === range}
            onPress={() => setCompanion((comp) => void (comp.attack.range = range))}
          />
        ))}
      </View>
      <Text style={styles.label}>Damage type</Text>
      <View style={styles.chipRow}>
        {(["physical", "magic"] as const).map((type) => (
          <Chip
            key={type}
            label={capitalize(type)}
            selected={companion.attack.damageType === type}
            onPress={() => setCompanion((comp) => void (comp.attack.damageType = type))}
          />
        ))}
      </View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function capitalize(value: string): string {
  return value.length > 0 ? `${value[0]!.toUpperCase()}${value.slice(1)}` : value;
}

function firstSentence(text: string): string {
  const match = /^.*?[.!?](?:\s|$)/.exec(text);
  return match?.[0].trim() ?? text;
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  block: { gap: 10, marginTop: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  sectionHeaderText: { flex: 1, gap: 3 },
  requiredHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.textSecondary, fontSize: 13 },
  list: { gap: 10 },
  smallButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.chip,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  smallButtonText: { color: colors.link, fontSize: 12, fontWeight: "800" },
  requiredBadge: {
    overflow: "hidden",
    borderRadius: radii.chip,
    backgroundColor: colors.highlightBackground,
    color: colors.accentBold,
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  choiceCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    padding: 16,
  },
  choiceCardSelected: { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.highlightBackground },
  selectedSummary: { borderColor: colors.accent },
  subclassCard: { borderColor: colors.borderLight },
  choiceHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  choiceTitle: { flex: 1, color: colors.textPrimary, fontSize: 19, fontWeight: "800" },
  choiceTitleSelected: { color: colors.accentBold },
  choiceBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  check: { color: colors.accentBold, fontSize: 20, fontWeight: "800" },
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
  selectButtonTextSelected: { color: colors.background },
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
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaPill: { borderRadius: radii.chip, backgroundColor: colors.borderSubtle, paddingHorizontal: 10, paddingVertical: 5 },
  metaPillText: { color: colors.textPrimary, fontSize: 12, fontWeight: "800" },
  featurePreview: { gap: 3, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 9 },
  featureKicker: { color: colors.accentBold, fontSize: 11, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  featureName: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
  featureText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
});
