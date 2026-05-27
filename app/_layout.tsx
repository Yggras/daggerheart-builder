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
        <Stack.Screen name="compendium/index" options={{ title: "Compendium" }} />
        <Stack.Screen name="compendium/[kind]/index" options={{ title: "Entries" }} />
        <Stack.Screen name="compendium/[kind]/[id]" options={{ title: "Entry" }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
