import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii } from "../../../theme";
import { getSrdEntryById } from "../../../srd/loadFixture";
import { classes, formatArmor, formatWeapon, tier1Armor, tier1PrimaryWeapons, tier1SecondaryWeapons, type ArmorOption, type WeaponOption } from "../../srdOptions";
import { Chip } from "../Chip";
import { OptionCard } from "../OptionCard";
import type { StepProps } from "./types";

const STANDARD_ITEMS = "A torch, 50 ft of rope, basic supplies, and a handful of gold.";

type BurdenFilter = "all" | "one_handed" | "two_handed";
type WeaponTypeFilter = "all" | "physical" | "magic";
type SpellcastFilter = "all" | "required" | "not_required";

export function EquipmentStep({ character, update }: StepProps) {
  const def = character.definition;
  const primary = tier1PrimaryWeapons.find((w) => w.id === def.equipment.primaryWeaponId);
  const primaryTwoHanded = primary?.burden === "two_handed";
  const primaryOneHanded = primary?.burden === "one_handed";
  const classEntry = classes.find((c) => c.id === def.classId);
  const subclass = def.subclassId ? getSrdEntryById(def.subclassId) : null;
  const hasSpellcastTrait = subclass?.kind === "subclass" && Boolean(subclass.spellcastTrait);
  const [search, setSearch] = useState("");
  const [burdenFilter, setBurdenFilter] = useState<BurdenFilter>("all");
  const [weaponTypeFilter, setWeaponTypeFilter] = useState<WeaponTypeFilter>("all");
  const [spellcastFilter, setSpellcastFilter] = useState<SpellcastFilter>("all");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleDetails = (id: string) => setExpandedIds((current) => ({ ...current, [id]: !current[id] }));

  const normalizedSearch = search.trim().toLowerCase();
  const filteredPrimaryWeapons = tier1PrimaryWeapons.filter((weapon) => {
    if (burdenFilter !== "all" && weapon.burden !== burdenFilter) return false;
    if (weaponTypeFilter !== "all" && weapon.weaponType !== weaponTypeFilter) return false;
    if (spellcastFilter === "required" && !weapon.requiresSpellcastTrait) return false;
    if (spellcastFilter === "not_required" && weapon.requiresSpellcastTrait) return false;
    if (!normalizedSearch) return true;
    return weaponSearchText(weapon).includes(normalizedSearch);
  });

  const filtersActive = search.trim().length > 0 || burdenFilter !== "all" || weaponTypeFilter !== "all" || spellcastFilter !== "all";

  const selectPrimary = (id: string) =>
    update((c) => {
      c.definition.equipment.primaryWeaponId = id;
      const weapon = tier1PrimaryWeapons.find((w) => w.id === id);
      if (weapon?.burden === "two_handed") c.definition.equipment.secondaryWeaponId = null;
    });

  const toggleSecondary = (id: string) =>
    update((c) => {
      c.definition.equipment.secondaryWeaponId = c.definition.equipment.secondaryWeaponId === id ? null : id;
    });

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Primary weapon</Text>
        <Text style={styles.count}>{filteredPrimaryWeapons.length}/{tier1PrimaryWeapons.length}</Text>
      </View>
      <Text style={styles.hint}>Choose one primary weapon. A one-handed weapon allows an optional secondary; a two-handed weapon does not.</Text>

      <TextInput
        style={styles.input}
        value={search}
        placeholder="Search weapons, traits, ranges, features…"
        placeholderTextColor={colors.placeholder}
        onChangeText={setSearch}
      />

      <View style={styles.filterBlock}>
        <Text style={styles.label}>Hands</Text>
        <View style={styles.chipRow}>
          <Chip label="All" selected={burdenFilter === "all"} onPress={() => setBurdenFilter("all")} />
          <Chip label="One-handed" selected={burdenFilter === "one_handed"} onPress={() => setBurdenFilter("one_handed")} />
          <Chip label="Two-handed" selected={burdenFilter === "two_handed"} onPress={() => setBurdenFilter("two_handed")} />
        </View>
      </View>

      <View style={styles.filterBlock}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          <Chip label="All" selected={weaponTypeFilter === "all"} onPress={() => setWeaponTypeFilter("all")} />
          <Chip label="Physical" selected={weaponTypeFilter === "physical"} onPress={() => setWeaponTypeFilter("physical")} />
          <Chip label="Magic" selected={weaponTypeFilter === "magic"} onPress={() => setWeaponTypeFilter("magic")} />
        </View>
      </View>

      <View style={styles.filterBlock}>
        <Text style={styles.label}>Spellcast</Text>
        <View style={styles.chipRow}>
          <Chip label="All" selected={spellcastFilter === "all"} onPress={() => setSpellcastFilter("all")} />
          <Chip label="Requires Spellcast" selected={spellcastFilter === "required"} onPress={() => setSpellcastFilter("required")} />
          <Chip label="No Spellcast" selected={spellcastFilter === "not_required"} onPress={() => setSpellcastFilter("not_required")} />
        </View>
      </View>

      {filtersActive ? (
        <Pressable
          style={styles.clearFilters}
          onPress={() => {
            setSearch("");
            setBurdenFilter("all");
            setWeaponTypeFilter("all");
            setSpellcastFilter("all");
          }}
        >
          <Text style={styles.clearFiltersText}>Clear weapon filters</Text>
        </Pressable>
      ) : null}

      <View style={styles.list}>
        {filteredPrimaryWeapons.map((weapon) => (
          <WeaponCard
            key={weapon.id}
            weapon={weapon}
            expanded={Boolean(expandedIds[weapon.id])}
            selected={def.equipment.primaryWeaponId === weapon.id}
            onPress={() => selectPrimary(weapon.id)}
            onToggleDetails={() => toggleDetails(weapon.id)}
            warning={spellcastWarning(weapon, hasSpellcastTrait)}
          />
        ))}
        {filteredPrimaryWeapons.length === 0 ? <Text style={styles.empty}>No primary weapons match those filters.</Text> : null}
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>Secondary weapon</Text>
        {!primary ? (
          <Text style={styles.hint}>Choose a primary weapon first. Secondary weapons are available only with a one-handed primary.</Text>
        ) : primaryTwoHanded ? (
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>No secondary available</Text>
            <Text style={styles.hint}>{primary.name} is two-handed and leaves no hand for a secondary weapon.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.hint}>Optional — {primaryOneHanded ? `${primary.name} is one-handed, so you can add one secondary weapon.` : "only with a one-handed primary."}</Text>
            <View style={styles.list}>
              {tier1SecondaryWeapons.map((weapon) => (
                <WeaponCard
                  key={weapon.id}
                  weapon={weapon}
                  expanded={Boolean(expandedIds[weapon.id])}
                  selected={def.equipment.secondaryWeaponId === weapon.id}
                  onPress={() => toggleSecondary(weapon.id)}
                  onToggleDetails={() => toggleDetails(weapon.id)}
                  warning={spellcastWarning(weapon, hasSpellcastTrait)}
                />
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>Armor</Text>
        <View style={styles.list}>
          {tier1Armor.map((armor) => (
            <ArmorCard
              key={armor.id}
              armor={armor}
              expanded={Boolean(expandedIds[armor.id])}
              selected={def.equipment.armorId === armor.id}
              onPress={() => update((c) => void (c.definition.equipment.armorId = armor.id))}
              onToggleDetails={() => toggleDetails(armor.id)}
            />
          ))}
        </View>
      </View>

      {classEntry ? (
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Class item</Text>
          <Text style={styles.hint}>Choose one.</Text>
          <View style={styles.list}>
            {classEntry.classItems.map((item) => (
              <OptionCard
                key={item}
                title={item}
                selected={def.equipment.chosenClassItemId === item}
                onPress={() => update((c) => void (c.definition.equipment.chosenClassItemId = item))}
              />
            ))}
          </View>
        </View>
      ) : (
        <Text style={styles.hint}>Choose a class to pick a class item.</Text>
      )}

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>Starting potion</Text>
        <View style={styles.chipRow}>
          <Chip
            label="Minor Health Potion"
            selected={def.equipment.potion === "minor_health"}
            onPress={() => update((c) => void (c.definition.equipment.potion = "minor_health"))}
          />
          <Chip
            label="Minor Stamina Potion"
            selected={def.equipment.potion === "minor_stamina"}
            onPress={() => update((c) => void (c.definition.equipment.potion = "minor_stamina"))}
          />
        </View>
      </View>

      <View style={styles.standard}>
        <Text style={styles.label}>Also carried</Text>
        <Text style={styles.hint}>{STANDARD_ITEMS}</Text>
      </View>
    </View>
  );
}

function WeaponCard({
  weapon,
  expanded,
  selected,
  warning,
  onPress,
  onToggleDetails,
}: {
  weapon: WeaponOption;
  expanded: boolean;
  selected: boolean;
  warning?: string | null;
  onPress: () => void;
  onToggleDetails: () => void;
}) {
  return (
    <View style={[styles.choiceCard, selected && styles.choiceCardSelected]}>
      <View style={styles.choiceHeader}>
        <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{weapon.name}</Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.choiceBody}>{formatWeapon(weapon)}</Text>
      <View style={styles.metaRow}>
        <MetaPill label={formatEnum(weapon.weaponType)} />
        <MetaPill label={formatEnum(weapon.burden)} />
        <MetaPill label={formatTrait(weapon.trait)} />
        <MetaPill label={formatRange(weapon.range)} />
      </View>
      {warning ? <Text style={styles.warning}>{warning}</Text> : null}
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
          <Text style={styles.choiceBody}>{weapon.text.original}</Text>
          {weapon.feature ? <FeaturePreview title="Weapon Feature" name={weapon.feature.name} text={weapon.feature.text} /> : <Text style={styles.hint}>No weapon feature.</Text>}
          {weapon.burden === "two_handed" ? <Text style={styles.warning}>Two-handed: selecting this removes any secondary weapon.</Text> : null}
          {weapon.requiresSpellcastTrait ? <Text style={styles.warning}>Requires a subclass with a Spellcast trait.</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function ArmorCard({
  armor,
  expanded,
  selected,
  onPress,
  onToggleDetails,
}: {
  armor: ArmorOption;
  expanded: boolean;
  selected: boolean;
  onPress: () => void;
  onToggleDetails: () => void;
}) {
  return (
    <View style={[styles.choiceCard, selected && styles.choiceCardSelected]}>
      <View style={styles.choiceHeader}>
        <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{armor.name}</Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.choiceBody}>{formatArmor(armor)}</Text>
      <View style={styles.metaRow}>
        <MetaPill label={`Major ${armor.baseThresholds.major ?? "—"}`} />
        <MetaPill label={`Severe ${armor.baseThresholds.severe ?? "—"}`} />
        <MetaPill label={`Score ${armor.baseScore}`} />
        {armor.feature ? <MetaPill label={armor.feature.name} /> : null}
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
          <Text style={styles.choiceBody}>{armor.text.original}</Text>
          {armor.feature ? <FeaturePreview title="Armor Feature" name={armor.feature.name} text={armor.feature.text} /> : <Text style={styles.hint}>No armor feature.</Text>}
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

function weaponSearchText(weapon: WeaponOption): string {
  return [
    weapon.name,
    weapon.text.original,
    weapon.text.summary,
    weapon.weaponType,
    weapon.trait,
    weapon.range,
    weapon.burden,
    weapon.feature?.name,
    weapon.feature?.text,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function spellcastWarning(weapon: WeaponOption, hasSpellcastTrait: boolean): string | null {
  if (!weapon.requiresSpellcastTrait || hasSpellcastTrait) return null;
  return "Requires a Spellcast trait. Choose a spellcasting subclass first or pick another weapon.";
}

function formatTrait(value: string): string {
  return value === "spellcast" ? "Spellcast" : formatEnum(value);
}

function formatRange(value: string): string {
  return formatEnum(value);
}

function formatEnum(value: string): string {
  return value
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  block: { gap: 10, marginTop: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  count: { color: colors.textTertiary, fontSize: 13, fontWeight: "800" },
  hint: { color: colors.textSecondary, fontSize: 13 },
  list: { gap: 10 },
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
  filterBlock: { gap: 6 },
  clearFilters: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.chip,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearFiltersText: { color: colors.link, fontSize: 13, fontWeight: "800" },
  empty: { color: colors.textTertiary, fontSize: 14, textAlign: "center", paddingVertical: 12 },
  callout: { gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, backgroundColor: colors.cardBackground, padding: 14 },
  calloutTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
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
  warning: { color: colors.accentBold, fontSize: 13, fontWeight: "700", lineHeight: 18 },
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  standard: { gap: 4, marginTop: 8 },
  label: { color: colors.textTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
});
