import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth/AuthProvider";
import { colors, radii } from "../src/theme";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Daggerheart Companion</Text>
        <Text style={styles.title}>Build the rules foundation first.</Text>
        <Text style={styles.body}>
          The prototype currently loads reviewed fixture data, validates it with Zod, and exposes it through an offline compendium.
        </Text>
      </View>

      <Link href="/characters" asChild>
        <Pressable style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Characters</Text>
        </Pressable>
      </Link>

      <Link href="/compendium" asChild>
        <Pressable style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Open Compendium</Text>
        </Pressable>
      </Link>

      <View style={styles.account}>
        {user?.email ? <Text style={styles.accountEmail}>Signed in as {user.email}</Text> : null}
        <Pressable onPress={signOut} hitSlop={8}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
    padding: 24,
    backgroundColor: colors.background,
  },
  hero: {
    gap: 12,
  },
  kicker: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 25,
  },
  primaryAction: {
    alignItems: "center",
    borderRadius: radii.button,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  primaryActionText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryAction: {
    alignItems: "center",
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  secondaryActionText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  account: {
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  accountEmail: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  signOut: {
    color: colors.link,
    fontSize: 15,
    fontWeight: "700",
  },
});
