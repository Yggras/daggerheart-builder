import * as Crypto from "expo-crypto";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii } from "../../../theme";
import type { Character, Companion } from "../../schema";
import { WIZARD_STRANGE_PATTERNS_KEY } from "../../steps";
import { classes, subclassesForClass } from "../../srdOptions";
import { Chip } from "../Chip";
import { OptionCard } from "../OptionCard";
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
  const subclasses = subclassesForClass(def.classId);

  const selectClass = (classId: string) =>
    update((c) => {
      if (c.definition.classId === classId) return;
      c.definition.classId = classId;
      // Reset choices that depend on class.
      c.definition.subclassId = null;
      c.definition.domainCards = [];
      c.definition.companion = null;
      delete c.definition.featureChoices[WIZARD_STRANGE_PATTERNS_KEY];
    });

  const selectSubclass = (subclassId: string) =>
    update((c) => {
      c.definition.subclassId = subclassId;
      c.definition.companion = subclassId === BEASTBOUND_ID ? c.definition.companion ?? makeCompanion() : null;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Class</Text>
      <View style={styles.list}>
        {classes.map((cls) => (
          <OptionCard
            key={cls.id}
            title={cls.name}
            subtitle={cls.domains.join(" & ")}
            selected={def.classId === cls.id}
            onPress={() => selectClass(cls.id)}
          />
        ))}
      </View>

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

      {def.classId ? (
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Subclass</Text>
          <View style={styles.list}>
            {subclasses.map((sub) => (
              <OptionCard
                key={sub.id}
                title={sub.name}
                subtitle={sub.spellcastTrait ? `Spellcast: ${capitalize(sub.spellcastTrait)}` : "No Spellcast trait"}
                selected={def.subclassId === sub.id}
                onPress={() => selectSubclass(sub.id)}
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

const styles = StyleSheet.create({
  container: { gap: 12 },
  block: { gap: 10, marginTop: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.textSecondary, fontSize: 13 },
  list: { gap: 10 },
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
