import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { createDraftCharacter, deleteCharacter, listCharacters } from "../../src/character/store";
import type { Character } from "../../src/character/schema";
import { WIZARD_STEPS, getStepStatus } from "../../src/character/steps";
import { getSrdEntryById } from "../../src/srd/loadFixture";
import { colors, radii } from "../../src/theme";

export default function CharacterListScreen() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);

  const refresh = useCallback(() => {
    listCharacters().then((loaded) => setCharacters([...loaded].sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt))));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onNew = useCallback(async () => {
    const character = await createDraftCharacter();
    router.push({ pathname: "/characters/[id]/build", params: { id: character.id } });
  }, [router]);

  const onOpen = useCallback(
    (character: Character) => {
      if (character.meta.status === "complete") {
        router.push({ pathname: "/characters/[id]", params: { id: character.id } });
      } else {
        router.push({ pathname: "/characters/[id]/build", params: { id: character.id } });
      }
    },
    [router],
  );

  const onDelete = useCallback(
    (character: Character) => {
      Alert.alert("Delete character?", characterName(character), [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCharacter(character.id).then(refresh),
        },
      ]);
    },
    [refresh],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Characters</Text>
        <Text style={styles.subtitle}>{characters.length === 0 ? "No characters yet" : `${characters.length} saved`}</Text>
      </View>

      <FlatList
        data={characters}
        keyExtractor={(character) => character.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>Tap “New Character” to start building.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onOpen(item)}>
            <View style={styles.cardMain}>
              <Text style={styles.name}>{characterName(item)}</Text>
              <Text style={styles.meta}>{characterSubtitle(item)}</Text>
              <Text style={styles.progress}>{characterProgress(item)}</Text>
              <View style={styles.chipRow}>{characterChips(item).map((chip) => <Text key={chip} style={styles.chip}>{chip}</Text>)}</View>
            </View>
            <View style={styles.cardSide}>
              <View style={[styles.badge, item.meta.status === "complete" ? styles.badgeComplete : styles.badgeDraft]}>
                <Text style={item.meta.status === "complete" ? styles.badgeTextComplete : styles.badgeTextDraft}>
                  {item.meta.status === "complete" ? "Complete" : "Draft"}
                </Text>
              </View>
              <Pressable hitSlop={8} onPress={() => onDelete(item)}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      <Pressable style={styles.newButton} onPress={onNew}>
        <Text style={styles.newButtonText}>+ New Character</Text>
      </Pressable>
    </View>
  );
}

function characterName(character: Character): string {
  return character.definition.identity.name.trim() || "Unnamed character";
}

function characterSubtitle(character: Character): string {
  const classId = character.definition.classId;
  const className = classId ? getSrdEntryById(classId)?.name ?? null : null;
  const subclassName = character.definition.subclassId ? getSrdEntryById(character.definition.subclassId)?.name ?? null : null;
  return className ? `${[className, subclassName].filter(Boolean).join(" · ")} • Level ${character.definition.level}` : "No class chosen yet";
}

function characterProgress(character: Character): string {
  const complete = WIZARD_STEPS.filter((step) => getStepStatus(step, character.definition) === "complete").length;
  return `${complete}/${WIZARD_STEPS.length} steps complete`;
}

function characterChips(character: Character): string[] {
  const chips: string[] = [];
  const ancestry = character.definition.heritage.ancestry.primaryId ? getSrdEntryById(character.definition.heritage.ancestry.primaryId)?.name : null;
  const community = character.definition.heritage.communityId ? getSrdEntryById(character.definition.heritage.communityId)?.name : null;
  if (ancestry) chips.push(ancestry);
  if (community) chips.push(community);
  if (character.definition.domainCards.length > 0) chips.push(`${character.definition.domainCards.length} cards`);
  return chips;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { gap: 4, marginBottom: 16 },
  title: { color: colors.textPrimary, fontSize: 32, fontWeight: "800" },
  subtitle: { color: colors.textTertiary, fontSize: 15 },
  listContent: { gap: 12, paddingBottom: 96 },
  empty: { color: colors.textTertiary, fontSize: 15, marginTop: 24, textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 72,
  },
  cardMain: { flex: 1, gap: 4 },
  cardSide: { alignItems: "flex-end", gap: 10 },
  name: { color: colors.textPrimary, fontSize: 20, fontWeight: "800" },
  meta: { color: colors.textSecondary, fontSize: 14 },
  progress: { color: colors.accentBold, fontSize: 13, fontWeight: "800" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  chip: { overflow: "hidden", borderRadius: radii.chip, backgroundColor: colors.borderSubtle, color: colors.textPrimary, fontSize: 12, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 4 },
  badge: { borderRadius: radii.chip, paddingHorizontal: 12, paddingVertical: 5 },
  badgeDraft: { backgroundColor: colors.highlightBackground },
  badgeComplete: { backgroundColor: colors.accent },
  badgeTextDraft: { color: colors.textPrimary, fontSize: 12, fontWeight: "700" },
  badgeTextComplete: { color: colors.background, fontSize: 12, fontWeight: "700" },
  delete: { color: colors.link, fontSize: 13, fontWeight: "800" },
  newButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    alignItems: "center",
    borderRadius: radii.button,
    backgroundColor: colors.textPrimary,
    paddingVertical: 16,
  },
  newButtonText: { color: colors.background, fontSize: 17, fontWeight: "800" },
});
