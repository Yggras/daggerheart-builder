import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinkedText } from "../../../src/compendium/components/LinkedText";
import { Section } from "../../../src/compendium/components/Section";
import { TagBadges } from "../../../src/compendium/components/TagBadges";
import { KindDetails } from "../../../src/compendium/details/KindDetails";
import { formatFamilyName, formatKind } from "../../../src/compendium/display";
import { getRelatedEntries, getSrdEntryById } from "../../../src/srd/loadFixture";
import type { SrdEntry } from "../../../src/srd/schema";
import { colors, radii } from "../../../src/theme";

export default function CompendiumDetailScreen() {
  const { kind, id } = useLocalSearchParams<{ kind: string; id: string }>();
  const entry = typeof id === "string" ? getSrdEntryById(id) : null;

  if (!entry) {
    return (
      <View style={styles.screenCentered}>
        <Text style={styles.missingTitle}>Entry not found</Text>
        <Link href="/compendium" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Compendium</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.breadcrumb}>
        <Link href="/compendium" asChild>
          <Pressable>
            <Text style={styles.breadcrumbLink}>Compendium</Text>
          </Pressable>
        </Link>
        <Text style={styles.breadcrumbSep}> &gt; </Text>
        <Link href={{ pathname: "/compendium/[kind]", params: { kind: entry.kind } }} asChild>
          <Pressable>
            <Text style={styles.breadcrumbLink}>{formatFamilyName(entry.kind)}</Text>
          </Pressable>
        </Link>
        <Text style={styles.breadcrumbSep}> &gt; </Text>
        <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{entry.name}</Text>
      </View>

      <Text style={styles.kind}>{formatKind(entry.kind)}</Text>
      <Text style={styles.title}>{entry.name}</Text>
      {entry.text.summary ? <LinkedText text={entry.text.summary} style={styles.summary} /> : null}

      {entry.tags.length > 0 ? (
        <View style={styles.tagsPanel}>
          <Text style={styles.tagsLabel}>Tags</Text>
          <TagBadges tags={entry.tags} />
        </View>
      ) : null}

      <KindDetails entry={entry} />

      <RelatedEntries entry={entry} />

      <Section title="Original Text">
        <LinkedText text={entry.text.original} style={styles.body} />
      </Section>
    </ScrollView>
  );
}

function RelatedEntries({ entry }: { entry: SrdEntry }) {
  const relatedEntries = getRelatedEntries(entry);

  if (relatedEntries.length === 0) {
    return null;
  }

  return (
    <Section title="Related Entries">
      <View style={styles.relatedList}>
        {relatedEntries.map((relatedEntry) => (
          <Link
            key={relatedEntry.id}
            href={{ pathname: "/compendium/[kind]/[id]", params: { kind: relatedEntry.kind, id: relatedEntry.id } }}
            asChild
          >
            <Pressable style={styles.relatedCard}>
              <Text style={styles.relatedKind}>{formatKind(relatedEntry.kind)}</Text>
              <Text style={styles.relatedTitle}>{relatedEntry.name}</Text>
              {relatedEntry.text.summary ? <Text style={styles.relatedSummary}>{relatedEntry.text.summary}</Text> : null}
            </Pressable>
          </Link>
        ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: colors.background,
    padding: 24,
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 40,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
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
    flexShrink: 1,
  },
  kind: {
    color: colors.accentBold,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
  },
  summary: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 25,
  },
  tagsPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    backgroundColor: colors.cardBackground,
    gap: 8,
    padding: 16,
  },
  tagsLabel: {
    color: colors.accentBold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  relatedList: {
    gap: 10,
  },
  relatedCard: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.button,
    backgroundColor: colors.background,
    gap: 4,
    padding: 12,
  },
  relatedKind: {
    color: colors.accentBold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  relatedTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  relatedSummary: {
    color: colors.textTertiary,
    fontSize: 14,
    lineHeight: 20,
  },
  missingTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  backButton: {
    borderRadius: radii.button,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButtonText: {
    color: colors.background,
    fontWeight: "800",
  },
});
