import { Link } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { formatFamilyName } from "../../src/compendium/display";
import { srdKinds } from "../../src/compendium/search";
import { srdEntries } from "../../src/srd/loadFixture";
import type { SrdEntry } from "../../src/srd/schema";

const familyOrder: SrdEntry["kind"][] = [
  "adversary",
  "environment",
  "class",
  "subclass",
  "domain_card",
  "ancestry",
  "community",
  "weapon",
  "armor",
  "loot",
  "rule_reference",
];

const countByKind = Object.fromEntries(
  srdKinds.map((kind) => [kind, srdEntries.filter((e) => e.kind === kind).length]),
) as Record<SrdEntry["kind"], number>;

export default function CompendiumOverviewScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Compendium</Text>
        <Text style={styles.subtitle}>{srdEntries.length} entries</Text>
      </View>

      <FlatList
        data={familyOrder}
        keyExtractor={(kind) => kind}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: kind }) => <FamilyCard kind={kind} count={countByKind[kind]} />}
      />
    </View>
  );
}

function FamilyCard({ kind, count }: { kind: SrdEntry["kind"]; count: number }) {
  return (
    <Link href={{ pathname: "/compendium/[kind]", params: { kind } }} asChild>
      <Pressable style={styles.card}>
        <Text style={styles.familyName}>{formatFamilyName(kind)}</Text>
        <Text style={styles.count}>{count} entries</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6f0e3",
    padding: 16,
  },
  header: {
    gap: 4,
    marginBottom: 16,
  },
  title: {
    color: "#201915",
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6a5b50",
    fontSize: 15,
  },
  listContent: {
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: "#dfd2c0",
    borderRadius: 18,
    backgroundColor: "#fffaf0",
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 72,
    justifyContent: "center",
    gap: 4,
  },
  familyName: {
    color: "#201915",
    fontSize: 22,
    fontWeight: "800",
  },
  count: {
    color: "#7c4f2a",
    fontSize: 14,
  },
});
