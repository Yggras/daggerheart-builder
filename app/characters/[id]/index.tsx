import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CharacterSummary } from "../../../src/character/components/CharacterSummary";
import { useCharacterDraft } from "../../../src/character/useCharacterDraft";
import { colors, radii } from "../../../src/theme";

export default function CharacterSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { character, loading } = useCharacterDraft(id);

  if (loading) return <Centered text="Loading…" />;
  if (!character) return <Centered text="Character not found." />;

  const def = character.definition;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: def.identity.name.trim() || "Character" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{def.identity.name.trim() || "Unnamed character"}</Text>
          <Pressable style={styles.editButton} onPress={() => router.push({ pathname: "/characters/[id]/build", params: { id } })}>
            <Text style={styles.editButtonText}>Edit in Builder</Text>
          </Pressable>
        </View>

        <CharacterSummary characterId={id} definition={def} editable />
      </ScrollView>
    </View>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.centeredText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  header: { gap: 12 },
  name: { color: colors.textPrimary, fontSize: 32, fontWeight: "800" },
  editButton: { alignItems: "center", borderRadius: radii.button, backgroundColor: colors.textPrimary, paddingVertical: 14 },
  editButtonText: { color: colors.background, fontSize: 16, fontWeight: "800" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  centeredText: { color: colors.textSecondary, fontSize: 16 },
});
