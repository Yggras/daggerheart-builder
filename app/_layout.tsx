import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/auth/AuthProvider";
import { SyncProvider } from "../src/character/sync/SyncProvider";
import { colors } from "../src/theme";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const onLoginScreen = segments[0] === "login";

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session && !onLoginScreen) return <Redirect href="/login" />;
  if (session && onLoginScreen) return <Redirect href="/" />;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SyncProvider>
      <AuthGate>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.textPrimary },
            headerTintColor: colors.background,
            headerTitleStyle: { fontWeight: "700" },
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ title: "Daggerheart" }} />
          <Stack.Screen name="characters/index" options={{ title: "Characters" }} />
          <Stack.Screen name="characters/[id]/index" options={{ title: "Character" }} />
          <Stack.Screen name="characters/[id]/build/index" options={{ title: "Build" }} />
          <Stack.Screen name="characters/[id]/build/[step]" options={{ title: "Build" }} />
          <Stack.Screen name="characters/[id]/build/review" options={{ title: "Review" }} />
          <Stack.Screen name="compendium/index" options={{ title: "Compendium" }} />
          <Stack.Screen name="compendium/[kind]/index" options={{ title: "Entries" }} />
          <Stack.Screen name="compendium/[kind]/[id]" options={{ title: "Entry" }} />
        </Stack>
      </AuthGate>
      </SyncProvider>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
