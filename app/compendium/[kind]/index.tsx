import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { formatFamilyName, formatTags } from "../../../src/compendium/display";
import {
  type CompendiumFilters,
  adversaryRoles,
  adversaryTiers,
  domainCardDomains,
  environmentTypes,
  lootTypes,
  searchFamily,
  weaponCategories,
} from "../../../src/compendium/search";
import { srdEntries } from "../../../src/srd/loadFixture";
import type { SrdEntry } from "../../../src/srd/schema";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getEntryMeta(entry: SrdEntry): string | null {
  switch (entry.kind) {
    case "adversary":
      return `Tier ${entry.tier} · ${capitalize(entry.role)}`;
    case "environment":
      return `Tier ${entry.tier} · ${capitalize(entry.environmentType)}`;
    case "weapon":
      return `Tier ${entry.tier} · ${capitalize(entry.category)}`;
    case "armor":
      return `Tier ${entry.tier}`;
    case "domain_card":
      return `${capitalize(entry.domain)} · Level ${entry.level}`;
    case "loot":
      return capitalize(entry.lootType);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Sub-filter row
// ---------------------------------------------------------------------------

type FilterOption = { label: string; value: string | number };

function FilterRow({
  options,
  selected,
  onSelect,
}: {
  options: FilterOption[];
  selected: string | number | "all";
  onSelect: (value: string | number | "all") => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onSelect(active ? "all" : opt.value)}
            style={[styles.chip, active && styles.chipSelected]}
          >
            <Text style={[styles.chipText, active && styles.chipTextSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SubFilters({
  kind,
  filters,
  onChange,
}: {
  kind: SrdEntry["kind"];
  filters: CompendiumFilters;
  onChange: (key: keyof Omit<CompendiumFilters, "kind">, value: string | number | "all") => void;
}) {
  switch (kind) {
    case "adversary":
      return (
        <>
          <FilterRow
            options={adversaryTiers.map((t) => ({ label: `Tier ${t}`, value: t }))}
            selected={filters.tier ?? "all"}
            onSelect={(v) => onChange("tier", v)}
          />
          <FilterRow
            options={adversaryRoles.map((r) => ({ label: capitalize(r), value: r }))}
            selected={filters.role ?? "all"}
            onSelect={(v) => onChange("role", v)}
          />
        </>
      );
    case "environment":
      return (
        <>
          <FilterRow
            options={adversaryTiers.map((t) => ({ label: `Tier ${t}`, value: t }))}
            selected={filters.tier ?? "all"}
            onSelect={(v) => onChange("tier", v)}
          />
          <FilterRow
            options={environmentTypes.map((t) => ({ label: capitalize(t), value: t }))}
            selected={filters.environmentType ?? "all"}
            onSelect={(v) => onChange("environmentType", v)}
          />
        </>
      );
    case "weapon":
      return (
        <>
          <FilterRow
            options={adversaryTiers.map((t) => ({ label: `Tier ${t}`, value: t }))}
            selected={filters.tier ?? "all"}
            onSelect={(v) => onChange("tier", v)}
          />
          <FilterRow
            options={weaponCategories.map((c) => ({ label: capitalize(c), value: c }))}
            selected={filters.category ?? "all"}
            onSelect={(v) => onChange("category", v)}
          />
        </>
      );
    case "armor":
      return (
        <FilterRow
          options={adversaryTiers.map((t) => ({ label: `Tier ${t}`, value: t }))}
          selected={filters.tier ?? "all"}
          onSelect={(v) => onChange("tier", v)}
        />
      );
    case "domain_card":
      return (
        <FilterRow
          options={domainCardDomains.map((d) => ({ label: capitalize(d), value: d }))}
          selected={filters.domain ?? "all"}
          onSelect={(v) => onChange("domain", v)}
        />
      );
    case "loot":
      return (
        <FilterRow
          options={lootTypes.map((l) => ({ label: capitalize(l), value: l }))}
          selected={filters.lootType ?? "all"}
          onSelect={(v) => onChange("lootType", v)}
        />
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Entry row
// ---------------------------------------------------------------------------

function EntryRow({ entry }: { entry: SrdEntry }) {
  const meta = getEntryMeta(entry);

  return (
    <Link href={{ pathname: "/compendium/[kind]/[id]", params: { kind: entry.kind, id: entry.id } }} asChild>
      <Pressable style={styles.card}>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <Text style={styles.cardTitle}>{entry.name}</Text>
        {entry.text.summary ? <Text style={styles.summary}>{entry.text.summary}</Text> : null}
        {entry.tags.length > 0 ? <Text style={styles.tags}>{formatTags(entry.tags)}</Text> : null}
      </Pressable>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function FamilyListScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CompendiumFilters>({ kind: kind as SrdEntry["kind"] });

  const handleFilterChange = (key: keyof Omit<CompendiumFilters, "kind">, value: string | number | "all") => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const results = searchFamily(srdEntries, query, filters);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{formatFamilyName(kind as SrdEntry["kind"])}</Text>
        <Text style={styles.subtitle}>{results.length} entries</Text>
      </View>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onChangeText={setQuery}
        placeholder={`Search ${formatFamilyName(kind as SrdEntry["kind"]).toLowerCase()}…`}
        placeholderTextColor="#85766a"
        style={styles.searchInput}
        value={query}
      />

      <SubFilters kind={kind as SrdEntry["kind"]} filters={filters} onChange={handleFilterChange} />

      <FlatList
        contentContainerStyle={styles.listContent}
        data={results}
        keyExtractor={(entry) => entry.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <EntryRow entry={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries match your search.</Text>}
      />
    </View>
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
    marginBottom: 12,
  },
  filterRow: {
    flexGrow: 0,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#d5c7b5",
    borderRadius: 999,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  chipSelected: {
    borderColor: "#201915",
    backgroundColor: "#201915",
  },
  chipText: {
    color: "#4e433b",
    fontWeight: "700",
  },
  chipTextSelected: {
    color: "#f6f0e3",
  },
  listContent: {
    gap: 12,
    paddingTop: 4,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: "#dfd2c0",
    borderRadius: 18,
    backgroundColor: "#fffaf0",
    padding: 16,
    minHeight: 64,
    justifyContent: "center",
    gap: 4,
  },
  meta: {
    color: "#8d5428",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: "#201915",
    fontSize: 20,
    fontWeight: "800",
  },
  summary: {
    color: "#4e433b",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  tags: {
    color: "#7c4f2a",
    fontSize: 13,
    marginTop: 6,
  },
  emptyText: {
    color: "#6a5b50",
    fontSize: 16,
    padding: 24,
    textAlign: "center",
  },
});
