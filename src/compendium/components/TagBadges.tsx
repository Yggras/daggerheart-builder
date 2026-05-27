import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../theme";

export function TagBadges({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <View key={tag} style={styles.badge}>
          <Text style={styles.text}>{tag.replaceAll("-", " ")}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.chip,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
});
