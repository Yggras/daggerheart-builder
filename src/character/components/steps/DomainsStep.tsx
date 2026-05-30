import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../../theme";
import { classes, level1CardsForClass, type DomainCardOption } from "../../srdOptions";
import type { StepProps } from "./types";

export function DomainsStep({ character, update }: StepProps) {
  const def = character.definition;
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const classEntry = classes.find((c) => c.id === def.classId);
  if (!classEntry) {
    return <Text style={styles.hint}>Choose a class to see its domain cards.</Text>;
  }

  const cards = level1CardsForClass(classEntry.domains);
  const selectedIds = new Set(def.domainCards.map((card) => card.cardId));
  const full = def.domainCards.length >= 2;
  const selectedCards = cards.filter((card) => selectedIds.has(card.id));
  const toggleDetails = (id: string) => setExpandedIds((current) => ({ ...current, [id]: !current[id] }));

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
      <View style={styles.headerCard}>
        <Text style={styles.count}>{def.domainCards.length}/2 selected</Text>
        <Text style={styles.hint}>Choose two level-1 cards from {classEntry.domains.join(" & ")}. Both can come from the same domain.</Text>
        {selectedCards.length > 0 ? (
          <View style={styles.selectedList}>
            {selectedCards.map((card) => (
              <Text key={card.id} style={styles.selectedItem}>✓ {card.name}</Text>
            ))}
          </View>
        ) : null}
      </View>

      {classEntry.domains.map((domain) => (
        <View key={domain} style={styles.domainGroup}>
          <Text style={styles.domainTitle}>{domain}</Text>
          <View style={styles.list}>
            {cards
              .filter((card) => card.domain === domain)
              .map((card) => {
                const selected = selectedIds.has(card.id);
                return (
                  <DomainCard
                    key={card.id}
                    card={card}
                    expanded={Boolean(expandedIds[card.id])}
                    selected={selected}
                    disabled={full && !selected}
                    onPress={() => toggle(card.id)}
                    onToggleDetails={() => toggleDetails(card.id)}
                  />
                );
              })}
          </View>
        </View>
      ))}
    </View>
  );
}

function DomainCard({
  card,
  expanded,
  selected,
  disabled,
  onPress,
  onToggleDetails,
}: {
  card: DomainCardOption;
  expanded: boolean;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
  onToggleDetails: () => void;
}) {
  const preview = card.abilities[0];

  return (
    <View style={[styles.card, selected && styles.cardSelected, disabled && styles.cardDisabled]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, selected && styles.cardTitleSelected]}>{card.name}</Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <View style={styles.metaRow}>
        <MetaPill label={formatEnum(card.cardType)} />
        <MetaPill label={`Recall ${card.recallCost}`} />
      </View>
      {preview ? <Text style={styles.preview}>{preview.name}: {firstSentence(preview.text)}</Text> : null}
      {disabled ? <Text style={styles.disabledHint}>Deselect another card to choose this one.</Text> : null}
      <View style={styles.actionRow}>
        <Pressable style={[styles.selectButton, selected && styles.selectButtonSelected, disabled && styles.buttonDisabled]} disabled={disabled} onPress={onPress}>
          <Text style={styles.selectButtonText}>{selected ? "Selected" : "Choose"}</Text>
        </Pressable>
        <Pressable style={styles.detailsButton} onPress={onToggleDetails}>
          <Text style={styles.detailsButtonText}>{expanded ? "Hide Details" : "Show Details"}</Text>
        </Pressable>
      </View>
      {expanded ? (
        <View style={styles.expandedDetails}>
          <Text style={styles.bodyText}>{card.text.original}</Text>
          {card.abilities.map((ability) => (
            <View key={ability.name} style={styles.ability}>
              <Text style={styles.abilityName}>{ability.name}</Text>
              <Text style={styles.bodyText}>{ability.text}</Text>
            </View>
          ))}
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

function firstSentence(text: string): string {
  const match = /^.*?[.!?](?:\s|$)/.exec(text);
  return match?.[0].trim() ?? text;
}

function formatEnum(value: string): string {
  return value
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  headerCard: { gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, backgroundColor: colors.cardBackground, padding: 14 },
  count: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.textSecondary, fontSize: 14 },
  selectedList: { gap: 3 },
  selectedItem: { color: colors.accentBold, fontSize: 13, fontWeight: "800" },
  domainGroup: { gap: 10 },
  domainTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  list: { gap: 10 },
  card: { gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, backgroundColor: colors.cardBackground, padding: 16 },
  cardSelected: { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.highlightBackground },
  cardDisabled: { opacity: 0.55 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { flex: 1, color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  cardTitleSelected: { color: colors.accentBold },
  check: { color: colors.accentBold, fontSize: 20, fontWeight: "800" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaPill: { borderRadius: radii.chip, backgroundColor: colors.borderSubtle, paddingHorizontal: 10, paddingVertical: 5 },
  metaPillText: { color: colors.textPrimary, fontSize: 12, fontWeight: "800" },
  preview: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  disabledHint: { color: colors.accentBold, fontSize: 13, fontWeight: "700" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectButton: { alignItems: "center", borderRadius: radii.button, backgroundColor: colors.textPrimary, paddingHorizontal: 16, paddingVertical: 10 },
  selectButtonSelected: { backgroundColor: colors.accent },
  selectButtonText: { color: colors.background, fontSize: 14, fontWeight: "800" },
  buttonDisabled: { opacity: 0.5 },
  detailsButton: { alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radii.button, backgroundColor: colors.cardBackground, paddingHorizontal: 16, paddingVertical: 10 },
  detailsButtonText: { color: colors.link, fontSize: 14, fontWeight: "800" },
  expandedDetails: { gap: 10, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 10 },
  ability: { gap: 3, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 8 },
  abilityName: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
  bodyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
