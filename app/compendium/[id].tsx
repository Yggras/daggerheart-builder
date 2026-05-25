import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatKind, formatTags } from "../../src/compendium/display";
import { getRelatedEntries, getSrdEntryById } from "../../src/srd/loadFixture";
import type { SrdEntry } from "../../src/srd/schema";

export default function CompendiumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
      <Text style={styles.kind}>{formatKind(entry.kind)}</Text>
      <Text style={styles.title}>{entry.name}</Text>
      {entry.text.summary ? <Text style={styles.summary}>{entry.text.summary}</Text> : null}

      <View style={styles.metaPanel}>
        <Text style={styles.metaLabel}>Review</Text>
        <Text style={styles.metaText}>{entry.review.status}</Text>
        <Text style={styles.metaLabel}>Tags</Text>
        <Text style={styles.metaText}>{formatTags(entry.tags)}</Text>
      </View>

      {renderKindDetails(entry)}

      <RelatedEntries entry={entry} />

      <Section title="Original Text">
        <Text style={styles.body}>{entry.text.original}</Text>
      </Section>
    </ScrollView>
  );
}

function renderKindDetails(entry: SrdEntry) {
  switch (entry.kind) {
    case "class":
      return (
        <Section title="Class Details">
          <KeyValue label="Domains" value={entry.domains.join(", ")} />
          <KeyValue label="Starting Evasion" value={String(entry.startingEvasion)} />
          <KeyValue label="Starting Hit Points" value={String(entry.startingHitPoints)} />
          <KeyValue label="Class Items" value={entry.classItems.join(" or ")} />
          <Feature title={entry.hopeFeature.name} text={entry.hopeFeature.text} />
          {entry.classFeatures.map((feature) => (
            <Feature key={feature.name} title={feature.name} text={feature.text} />
          ))}
        </Section>
      );
    case "subclass":
      return (
        <Section title="Subclass Details">
          <KeyValue label="Class" value={entry.classId} />
          <KeyValue label="Spellcast Trait" value={entry.spellcastTrait ?? "None"} />
          {entry.features.foundation.map((feature) => (
            <Feature key={feature.name} title={`Foundation: ${feature.name}`} text={feature.text} />
          ))}
          {entry.features.specialization.map((feature) => (
            <Feature key={feature.name} title={`Specialization: ${feature.name}`} text={feature.text} />
          ))}
          {entry.features.mastery.map((feature) => (
            <Feature key={feature.name} title={`Mastery: ${feature.name}`} text={feature.text} />
          ))}
        </Section>
      );
    case "domain_card":
      return (
        <Section title="Card Details">
          <KeyValue label="Domain" value={entry.domain} />
          <KeyValue label="Level" value={String(entry.level)} />
          <KeyValue label="Type" value={entry.cardType} />
          <KeyValue label="Recall Cost" value={String(entry.recallCost)} />
          {entry.abilities.map((ability) => (
            <Feature key={ability.name} title={ability.name} text={ability.text} />
          ))}
        </Section>
      );
    case "weapon":
      return (
        <Section title="Weapon Details">
          <KeyValue label="Category" value={entry.category} />
          <KeyValue label="Tier" value={String(entry.tier)} />
          <KeyValue label="Trait" value={entry.trait} />
          <KeyValue label="Range" value={entry.range} />
          <KeyValue label="Damage" value={`${entry.damage.dice} ${entry.damage.type}`} />
          <KeyValue label="Burden" value={entry.burden} />
          <KeyValue label="Requires Spellcast Trait" value={entry.requiresSpellcastTrait ? "Yes" : "No"} />
          {entry.feature ? <Feature title={entry.feature.name} text={entry.feature.text} /> : null}
        </Section>
      );
    case "ancestry":
      return (
        <Section title="Ancestry Details">
          {entry.features.map((feature) => (
            <Feature key={feature.name} title={feature.name} text={feature.text} />
          ))}
        </Section>
      );
    case "community":
      return (
        <Section title="Community Details">
          <KeyValue label="Adjectives" value={entry.adjectives.join(", ")} />
          <Feature title={entry.feature.name} text={entry.feature.text} />
        </Section>
      );
    case "armor":
      return (
        <Section title="Armor Details">
          <KeyValue label="Tier" value={String(entry.tier)} />
          <KeyValue label="Levels" value={`${entry.levelRange.min}-${entry.levelRange.max}`} />
          <KeyValue label="Base Thresholds" value={formatThresholds(entry.baseThresholds)} />
          <KeyValue label="Base Score" value={String(entry.baseScore)} />
          {entry.feature ? <Feature title={entry.feature.name} text={entry.feature.text} /> : null}
        </Section>
      );
    case "loot":
      return (
        <Section title="Loot Details">
          <KeyValue label="Type" value={entry.lootType} />
          <KeyValue label="Roll" value={String(entry.roll).padStart(2, "0")} />
          <KeyValue label="Max Quantity" value={entry.maxQuantity ? String(entry.maxQuantity) : "Not limited"} />
        </Section>
      );
    case "adversary":
      return (
        <Section title="Adversary Details">
          <KeyValue label="Tier" value={String(entry.tier)} />
          <KeyValue label="Role" value={entry.role} />
          <KeyValue label="Difficulty" value={String(entry.difficulty)} />
          <KeyValue label="Thresholds" value={formatThresholds(entry.thresholds)} />
          <KeyValue label="HP" value={String(entry.hitPoints)} />
          <KeyValue label="Stress" value={String(entry.stress)} />
          <KeyValue label="Attack" value={formatAttack(entry.attack)} />
          <KeyValue label="Motives & Tactics" value={entry.motivesAndTactics.join(", ")} />
          {entry.experiences.length > 0 ? (
            <KeyValue
              label="Experiences"
              value={entry.experiences.map((experience) => `${experience.name} +${experience.modifier}`).join(", ")}
            />
          ) : null}
          {entry.features.map((feature) => (
            <Feature key={feature.name} title={feature.name} text={feature.text} />
          ))}
        </Section>
      );
    case "environment":
      return (
        <Section title="Environment Details">
          <KeyValue label="Tier" value={String(entry.tier)} />
          <KeyValue label="Type" value={entry.environmentType} />
          <KeyValue label="Difficulty" value={String(entry.difficulty)} />
          <KeyValue label="Impulses" value={entry.impulses.join(", ")} />
          {entry.features.map((feature) => (
            <Feature key={feature.name} title={feature.name} text={feature.text} />
          ))}
        </Section>
      );
    case "rule_reference":
      return (
        <Section title="Rule Details">
          <KeyValue label="Category" value={entry.category} />
          <KeyValue label="Headings" value={entry.headings.join(" > ")} />
        </Section>
      );
  }
}

function formatThresholds(thresholds: { major: number | null; severe: number | null }) {
  if (thresholds.major === null && thresholds.severe === null) {
    return "None";
  }

  return `${thresholds.major ?? "None"}/${thresholds.severe ?? "None"}`;
}

function formatAttack(attack: Extract<SrdEntry, { kind: "adversary" }>["attack"]) {
  return `${attack.modifier >= 0 ? "+" : ""}${attack.modifier} | ${attack.name}: ${attack.range} | ${attack.damage.roll} ${attack.damage.type}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.keyValue}>
      <Text style={styles.key}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
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
          <Link key={relatedEntry.id} href={{ pathname: "/compendium/[id]", params: { id: relatedEntry.id } }} asChild>
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
    backgroundColor: "#f6f0e3",
  },
  screenCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#f6f0e3",
    padding: 24,
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 40,
  },
  kind: {
    color: "#8d5428",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#201915",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
  },
  summary: {
    color: "#4e433b",
    fontSize: 17,
    lineHeight: 25,
  },
  metaPanel: {
    borderWidth: 1,
    borderColor: "#dfd2c0",
    borderRadius: 18,
    backgroundColor: "#fffaf0",
    gap: 4,
    padding: 16,
  },
  metaLabel: {
    color: "#8d5428",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
    textTransform: "uppercase",
  },
  metaText: {
    color: "#201915",
    fontSize: 15,
    lineHeight: 21,
  },
  section: {
    borderWidth: 1,
    borderColor: "#dfd2c0",
    borderRadius: 18,
    backgroundColor: "#fffaf0",
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    color: "#201915",
    fontSize: 22,
    fontWeight: "800",
  },
  keyValue: {
    gap: 2,
  },
  key: {
    color: "#8d5428",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  value: {
    color: "#201915",
    fontSize: 15,
  },
  feature: {
    gap: 4,
  },
  featureTitle: {
    color: "#201915",
    fontSize: 17,
    fontWeight: "800",
  },
  body: {
    color: "#4e433b",
    fontSize: 15,
    lineHeight: 22,
  },
  relatedList: {
    gap: 10,
  },
  relatedCard: {
    borderWidth: 1,
    borderColor: "#eadcca",
    borderRadius: 14,
    backgroundColor: "#f6f0e3",
    gap: 4,
    padding: 12,
  },
  relatedKind: {
    color: "#8d5428",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  relatedTitle: {
    color: "#201915",
    fontSize: 17,
    fontWeight: "800",
  },
  relatedSummary: {
    color: "#6a5b50",
    fontSize: 14,
    lineHeight: 20,
  },
  missingTitle: {
    color: "#201915",
    fontSize: 24,
    fontWeight: "800",
  },
  backButton: {
    borderRadius: 14,
    backgroundColor: "#201915",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#f6f0e3",
    fontWeight: "800",
  },
});
