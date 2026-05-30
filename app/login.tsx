import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../src/auth/AuthProvider";
import { colors, radii } from "../src/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  async function handleSignIn() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setSubmitting(false);
    }
    // On success the root AuthGate redirects automatically; leave submitting true to avoid flicker.
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.hero}>
        <Text style={styles.kicker}>Daggerheart Companion</Text>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.body}>Accounts are provisioned by the admin. There is no signup or password reset.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="username"
          editable={!submitting}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
          editable={!submitting}
          onSubmitEditing={handleSignIn}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primaryAction, !canSubmit && styles.primaryActionDisabled]}
          onPress={handleSignIn}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.primaryActionText}>Sign in</Text>
          )}
        </Pressable>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 32,
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
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: 14,
  },
  input: {
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  error: {
    color: colors.accentBold,
    fontSize: 14,
    fontWeight: "600",
  },
  primaryAction: {
    alignItems: "center",
    borderRadius: radii.button,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  primaryActionDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
});
