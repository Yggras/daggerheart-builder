import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#f6f0e3" },
          headerStyle: { backgroundColor: "#201915" },
          headerTintColor: "#f6f0e3",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Daggerheart" }} />
        <Stack.Screen name="compendium/index" options={{ title: "Compendium" }} />
        <Stack.Screen name="compendium/[id]" options={{ title: "Entry" }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
