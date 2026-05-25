import { Link } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { formatKind, formatTags } from "../../src/compendium/display";
import { compendiumKindFilters, searchCompendium, type CompendiumKindFilter } from "../../src/compendium/search";
import { srdEntries } from "../../src/srd/loadFixture";
import type { SrdEntry } from "../../src/srd/schema";

export default function CompendiumScreen() {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<CompendiumKindFilter>("all");
  const entries = searchCompendium(srdEntries, query, kindFilter);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Compendium</Text>
        <Text style={styles.subtitle}>{entries.length} reviewed fixture entries</Text>
      </View>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onChangeText={setQuery}
        placeholder="Search rules, classes, cards, weapons..."
        placeholderTextColor="#85766a"
        style={styles.searchInput}
        value={query}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {compendiumKindFilters.map((filter) => {
          const selected = filter === kindFilter;
          return (
            <Pressable
              key={filter}
              onPress={() => setKindFilter(filter)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
            >
              <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                {filter === "all" ? "All" : formatKind(filter)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={entries}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item }) => <CompendiumRow entry={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries match your search.</Text>}
      />
    </View>
  );
}

function CompendiumRow({ entry }: { entry: SrdEntry }) {
  return (
    <Link href={{ pathname: "/compendium/[id]", params: { id: entry.id } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.kind}>{formatKind(entry.kind)}</Text>
        </View>
        <Text style={styles.cardTitle}>{entry.name}</Text>
        {entry.text.summary ? <Text style={styles.summary}>{entry.text.summary}</Text> : null}
        <Text style={styles.tags}>{formatTags(entry.tags)}</Text>
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
  searchInput: {
    borderWidth: 1,
    borderColor: "#d5c7b5",
    borderRadius: 14,
    backgroundColor: "#fffaf0",
    color: "#201915",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filters: {
    flexGrow: 0,
    marginTop: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#d5c7b5",
    borderRadius: 999,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipSelected: {
    borderColor: "#201915",
    backgroundColor: "#201915",
  },
  filterChipText: {
    color: "#4e433b",
    fontWeight: "700",
  },
  filterChipTextSelected: {
    color: "#f6f0e3",
  },
  listContent: {
    gap: 12,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: "#dfd2c0",
    borderRadius: 18,
    backgroundColor: "#fffaf0",
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  kind: {
    color: "#8d5428",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: "#201915",
    fontSize: 22,
    fontWeight: "800",
  },
  summary: {
    color: "#4e433b",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
  },
  tags: {
    color: "#7c4f2a",
    fontSize: 13,
    marginTop: 12,
  },
  emptyText: {
    color: "#6a5b50",
    fontSize: 16,
    padding: 24,
    textAlign: "center",
  },
});
