import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/theme";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.textPrimary },
          headerTintColor: colors.background,
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
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
      <StatusBar style="light" />
    </>
  );
}
