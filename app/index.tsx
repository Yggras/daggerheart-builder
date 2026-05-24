import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Daggerheart Companion</Text>
        <Text style={styles.title}>Build the rules foundation first.</Text>
        <Text style={styles.body}>
          The prototype currently loads reviewed fixture data, validates it with Zod, and exposes it through an offline compendium.
        </Text>
      </View>

      <Link href="/compendium" asChild>
        <Pressable style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Open Compendium</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
    padding: 24,
    backgroundColor: "#f6f0e3",
  },
  hero: {
    gap: 12,
  },
  kicker: {
    color: "#7c4f2a",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: "#201915",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
  },
  body: {
    color: "#4e433b",
    fontSize: 17,
    lineHeight: 25,
  },
  primaryAction: {
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#201915",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  primaryActionText: {
    color: "#f6f0e3",
    fontSize: 16,
    fontWeight: "700",
  },
});
