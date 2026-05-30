import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../theme";

export function BuilderTopNav({
  characterId,
  showAllSteps,
}: {
  characterId: string;
  showAllSteps?: boolean;
}) {
  const router = useRouter();

  return (
    <View style={styles.nav}>
      <Pressable style={styles.linkButton} onPress={() => router.replace("/characters")}>
        <Text style={styles.linkText}>Exit to Characters</Text>
      </Pressable>
      {showAllSteps ? (
        <Pressable
          style={styles.linkButton}
          onPress={() => router.push({ pathname: "/characters/[id]/build", params: { id: characterId } })}
        >
          <Text style={styles.linkText}>All Steps</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  linkButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.chip,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkText: { color: colors.link, fontSize: 13, fontWeight: "800" },
});
