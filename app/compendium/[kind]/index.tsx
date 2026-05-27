import { Link, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { HighlightedText } from "../../../src/compendium/components/HighlightedText";
import { TagBadges } from "../../../src/compendium/components/TagBadges";
import { capitalize, formatFamilyName } from "../../../src/compendium/display";
import {
  type CompendiumFilters,
  type SortOption,
  adversaryRoles,
  adversaryTiers,
  domainCardDomains,
  environmentTypes,
  lootTypes,
  searchFamily,
  sortResults,
  weaponCategories,
} from "../../../src/compendium/search";
import { srdEntries } from "../../../src/srd/loadFixture";
import type { SrdEntry } from "../../../src/srd/schema";
import { colors, radii } from "../../../src/theme";

const kindsWithTier = new Set<SrdEntry["kind"]>(["adversary", "environment", "weapon", "armor"]);

const kindsWithFilters = new Set<SrdEntry["kind"]>([
  "adversary",
  "environment",
  "weapon",
  "armor",
  "domain_card",
  "loot",
]);

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
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: FilterOption[];
  selected: string | number | "all";
  onSelect: (value: string | number | "all") => void;
}) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRowContent}
      >
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
    </View>
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
            label="Tier"
            options={adversaryTiers.map((t) => ({ label: `Tier ${t}`, value: t }))}
            selected={filters.tier ?? "all"}
            onSelect={(v) => onChange("tier", v)}
          />
          <FilterRow
            label="Role"
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
            label="Tier"
            options={adversaryTiers.map((t) => ({ label: `Tier ${t}`, value: t }))}
            selected={filters.tier ?? "all"}
            onSelect={(v) => onChange("tier", v)}
          />
          <FilterRow
            label="Type"
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
            label="Tier"
            options={adversaryTiers.map((t) => ({ label: `Tier ${t}`, value: t }))}
            selected={filters.tier ?? "all"}
            onSelect={(v) => onChange("tier", v)}
          />
          <FilterRow
            label="Category"
            options={weaponCategories.map((c) => ({ label: capitalize(c), value: c }))}
            selected={filters.category ?? "all"}
            onSelect={(v) => onChange("category", v)}
          />
        </>
      );
    case "armor":
      return (
        <FilterRow
          label="Tier"
          options={adversaryTiers.map((t) => ({ label: `Tier ${t}`, value: t }))}
          selected={filters.tier ?? "all"}
          onSelect={(v) => onChange("tier", v)}
        />
      );
    case "domain_card":
      return (
        <FilterRow
          label="Domain"
          options={domainCardDomains.map((d) => ({ label: capitalize(d), value: d }))}
          selected={filters.domain ?? "all"}
          onSelect={(v) => onChange("domain", v)}
        />
      );
    case "loot":
      return (
        <FilterRow
          label="Type"
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

function EntryRow({ entry, highlight }: { entry: SrdEntry; highlight: string }) {
  const meta = getEntryMeta(entry);

  return (
    <Link href={{ pathname: "/compendium/[kind]/[id]", params: { kind: entry.kind, id: entry.id } }} asChild>
      <Pressable style={styles.card}>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <HighlightedText text={entry.name} highlight={highlight} style={styles.cardTitle} />
        {entry.text.summary ? (
          <HighlightedText text={entry.text.summary} highlight={highlight} style={styles.summary} />
        ) : null}
        {entry.tags.length > 0 ? (
          <View style={styles.cardTags}>
            <TagBadges tags={entry.tags} />
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

function countActiveFilters(filters: CompendiumFilters): number {
  return Object.entries(filters).filter(([k, v]) => k !== "kind" && v !== undefined && v !== "all").length;
}

export default function FamilyListScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const typedKind = kind as SrdEntry["kind"];
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CompendiumFilters>({ kind: typedKind });
  const [sort, setSort] = useState<SortOption>("name_asc");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const handleFilterChange = (key: keyof Omit<CompendiumFilters, "kind">, value: string | number | "all") => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = query !== "" || activeFilterCount > 0;
  const hasFilterOptions = kindsWithFilters.has(typedKind);

  const handleClearFilters = () => {
    setQuery("");
    setFilters({ kind: typedKind });
    setSort("name_asc");
  };

  const results = useMemo(() => {
    const filtered = searchFamily(srdEntries, query, filters);
    return sortResults(filtered, sort);
  }, [query, filters, sort]);

  return (
    <View style={styles.screen}>
      <View style={styles.breadcrumb}>
        <Link href="/compendium" asChild>
          <Pressable>
            <Text style={styles.breadcrumbLink}>Compendium</Text>
          </Pressable>
        </Link>
        <Text style={styles.breadcrumbSep}> &gt; </Text>
        <Text style={styles.breadcrumbCurrent}>{formatFamilyName(typedKind)}</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{formatFamilyName(typedKind)}</Text>
        <Text style={styles.subtitle}>{results.length} entries</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder={`Search ${formatFamilyName(typedKind).toLowerCase()}…`}
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
          value={query}
        />
      </View>

      <View style={styles.toolbarRow}>
        {hasFilterOptions ? (
          <Pressable
            onPress={() => setFiltersExpanded((v) => !v)}
            style={[styles.toolbarButton, filtersExpanded && styles.toolbarButtonActive]}
          >
            <Text style={[styles.toolbarButtonText, filtersExpanded && styles.toolbarButtonTextActive]}>
              {filtersExpanded ? "Hide Filters" : "Filters"}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.sortRow}>
          {(
            [
              { label: "A-Z", value: "name_asc" as SortOption },
              { label: "Z-A", value: "name_desc" as SortOption },
              ...(kindsWithTier.has(typedKind)
                ? [{ label: "Tier", value: "tier_asc" as SortOption }]
                : []),
            ] as { label: string; value: SortOption }[]
          ).map((opt) => {
            const active = sort === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSort(opt.value)}
                style={[styles.sortButton, active && styles.sortButtonActive]}
              >
                <Text style={[styles.sortButtonText, active && styles.sortButtonTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {hasActiveFilters ? (
          <Pressable onPress={handleClearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      {filtersExpanded ? (
        <View style={styles.filtersPanel}>
          <SubFilters kind={typedKind} filters={filters} onChange={handleFilterChange} />
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={results}
        keyExtractor={(entry) => entry.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <EntryRow entry={item} highlight={query} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries match your search.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  breadcrumbLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  breadcrumbSep: {
    color: colors.textTertiary,
    fontSize: 13,
  },
  breadcrumbCurrent: {
    color: colors.textTertiary,
    fontSize: 13,
  },
  header: {
    gap: 4,
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textTertiary,
    fontSize: 15,
  },
  searchRow: {
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.input,
    backgroundColor: colors.cardBackground,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  toolbarButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.input,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toolbarButtonActive: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.textPrimary,
  },
  toolbarButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  toolbarButtonTextActive: {
    color: colors.background,
  },
  clearButton: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  sortRow: {
    flexDirection: "row",
    gap: 6,
  },
  sortButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.input,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sortButtonActive: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.textPrimary,
  },
  sortButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  sortButtonTextActive: {
    color: colors.background,
  },
  filtersPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  filterSection: {
    gap: 6,
  },
  filterLabel: {
    color: colors.accentBold,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterRowContent: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.chip,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.textPrimary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: colors.background,
  },
  listContent: {
    gap: 12,
    paddingTop: 4,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    padding: 16,
    minHeight: 64,
    justifyContent: "center",
    gap: 4,
  },
  meta: {
    color: colors.accentBold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  summary: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  cardTags: {
    marginTop: 6,
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 16,
    padding: 24,
    textAlign: "center",
  },
});
