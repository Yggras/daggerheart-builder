import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme";
import { classes, level1CardsForClass } from "../../srdOptions";
import { OptionCard } from "../OptionCard";
import type { StepProps } from "./types";

export function DomainsStep({ character, update }: StepProps) {
  const def = character.definition;
  const classEntry = classes.find((c) => c.id === def.classId);
  if (!classEntry) {
    return <Text style={styles.hint}>Choose a class to see its domain cards.</Text>;
  }

  const cards = level1CardsForClass(classEntry.domains);
  const selectedIds = new Set(def.domainCards.map((card) => card.cardId));
  const full = def.domainCards.length >= 2;

  const toggle = (cardId: string) =>
    update((c) => {
      const list = c.definition.domainCards;
      const index = list.findIndex((card) => card.cardId === cardId);
      if (index >= 0) {
        list.splice(index, 1);
      } else if (list.length < 2) {
        list.push({ cardId, location: "loadout" });
      }
    });

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Choose two level-1 cards from {classEntry.domains.join(" & ")} ({def.domainCards.length}/2 selected).
      </Text>
      <View style={styles.list}>
        {cards.map((card) => {
          const selected = selectedIds.has(card.id);
          return (
            <OptionCard
              key={card.id}
              title={card.name}
              subtitle={`${card.domain} · ${card.cardType} · Recall ${card.recallCost}`}
              selected={selected}
              disabled={full && !selected}
              onPress={() => toggle(card.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  hint: { color: colors.textSecondary, fontSize: 14 },
  list: { gap: 10 },
});
