import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme";
import { classes, formatArmor, formatWeapon, tier1Armor, tier1PrimaryWeapons, tier1SecondaryWeapons } from "../../srdOptions";
import { Chip } from "../Chip";
import { OptionCard } from "../OptionCard";
import type { StepProps } from "./types";

const STANDARD_ITEMS = "A torch, 50 ft of rope, basic supplies, and a handful of gold.";

export function EquipmentStep({ character, update }: StepProps) {
  const def = character.definition;
  const primary = tier1PrimaryWeapons.find((w) => w.id === def.equipment.primaryWeaponId);
  const primaryTwoHanded = primary?.burden === "two_handed";
  const classEntry = classes.find((c) => c.id === def.classId);

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
      <Text style={styles.sectionTitle}>Primary weapon</Text>
      <View style={styles.list}>
        {tier1PrimaryWeapons.map((weapon) => (
          <OptionCard
            key={weapon.id}
            title={weapon.name}
            subtitle={formatWeapon(weapon)}
            selected={def.equipment.primaryWeaponId === weapon.id}
            onPress={() => selectPrimary(weapon.id)}
          />
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>Secondary weapon</Text>
        {primaryTwoHanded ? (
          <Text style={styles.hint}>Your two-handed primary weapon leaves no hand for a secondary.</Text>
        ) : (
          <>
            <Text style={styles.hint}>Optional — only with a one-handed primary.</Text>
            <View style={styles.list}>
              {tier1SecondaryWeapons.map((weapon) => (
                <OptionCard
                  key={weapon.id}
                  title={weapon.name}
                  subtitle={formatWeapon(weapon)}
                  selected={def.equipment.secondaryWeaponId === weapon.id}
                  onPress={() => toggleSecondary(weapon.id)}
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
            <OptionCard
              key={armor.id}
              title={armor.name}
              subtitle={formatArmor(armor)}
              selected={def.equipment.armorId === armor.id}
              onPress={() => update((c) => void (c.definition.equipment.armorId = armor.id))}
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

const styles = StyleSheet.create({
  container: { gap: 12 },
  block: { gap: 10, marginTop: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.textSecondary, fontSize: 13 },
  list: { gap: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  standard: { gap: 4, marginTop: 8 },
  label: { color: colors.textTertiary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
});
