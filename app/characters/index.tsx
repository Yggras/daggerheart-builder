import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/auth/AuthProvider";
import { createDraftCharacter, deleteCharacter, listCharacters, subscribeToStore } from "../../src/character/store";
import type { Character } from "../../src/character/schema";
import { getSrdEntryById } from "../../src/srd/loadFixture";
import { colors, radii } from "../../src/theme";

export default function CharacterListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);

  const refresh = useCallback(() => {
    listCharacters().then(setCharacters);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // Refresh live when the store changes — including remote edits the sync engine applies.
  useEffect(() => subscribeToStore(() => refresh()), [refresh]);

  const onNew = useCallback(async () => {
    const character = await createDraftCharacter(user?.id);
    router.push({ pathname: "/characters/[id]/build", params: { id: character.id } });
  }, [router, user?.id]);

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
          <Pressable style={styles.card} onPress={() => onOpen(item)} onLongPress={() => onDelete(item)}>
            <View style={styles.cardMain}>
              <Text style={styles.name}>{characterName(item)}</Text>
              <Text style={styles.meta}>{characterSubtitle(item)}</Text>
            </View>
            <View style={[styles.badge, item.meta.status === "complete" ? styles.badgeComplete : styles.badgeDraft]}>
              <Text style={item.meta.status === "complete" ? styles.badgeTextComplete : styles.badgeTextDraft}>
                {item.meta.status === "complete" ? "Complete" : "Draft"}
              </Text>
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
  return className ? `${className} • Level ${character.definition.level}` : "No class chosen yet";
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
    alignItems: "center",
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
  name: { color: colors.textPrimary, fontSize: 20, fontWeight: "800" },
  meta: { color: colors.textSecondary, fontSize: 14 },
  badge: { borderRadius: radii.chip, paddingHorizontal: 12, paddingVertical: 5 },
  badgeDraft: { backgroundColor: colors.highlightBackground },
  badgeComplete: { backgroundColor: colors.accent },
  badgeTextDraft: { color: colors.textPrimary, fontSize: 12, fontWeight: "700" },
  badgeTextComplete: { color: colors.background, fontSize: 12, fontWeight: "700" },
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
